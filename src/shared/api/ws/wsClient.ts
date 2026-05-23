// wsClient.ts
import { v4 as uuidv4 } from "uuid";

import { useAuthStore } from "../store"; // Укажите правильный относительный путь к Zustand-стору
import { QueuedRequest, WSBaseResponse, WSHandler, WSStatus } from "./model/types";
import { useWSRequestStore } from "./model/wsRequest.store";
import { logIncomingMessage, logOutgoingMessage, logQueuedMessage } from "./wsLogger";

let socket: WebSocket | null = null;
let currentToken: string | null = null;
let status: WSStatus = "idle";
let requestQueue: QueuedRequest[] = [];

let reconnectAttempts = 0;
let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
let manualClose = false;

let activityPingInterval: ReturnType<typeof setInterval> | null = null;

const MAX_RECONNECT_DELAY = 30_000;

const handlers = new Set<WSHandler>();

const getReconnectDelay = () => Math.min(1000 * 2 ** reconnectAttempts, MAX_RECONNECT_DELAY);

const clearReconnectTimeout = () => {
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }
};

export const subscribeToWS = (handler: WSHandler) => {
  handlers.add(handler);
  return () => {
    handlers.delete(handler);
  };
};

const drainQueue = () => {
  if (!socket || socket.readyState !== WebSocket.OPEN) return;

  while (requestQueue.length > 0) {
    const request = requestQueue.shift();
    if (request) {
      logOutgoingMessage(request);
      socket.send(JSON.stringify(request));
    }
  }
};

const attachHandlers = (ws: WebSocket) => {
  // Функция управления регулярным пингом
  const startActivityPingTimer = () => {
    if (activityPingInterval) {
      clearInterval(activityPingInterval);
    }

    activityPingInterval = setInterval(() => {
      if (ws.readyState !== WebSocket.OPEN) return;
      ws.send(JSON.stringify({ action: "ping" }));
    }, 20_000); // Строго 20 секунд по ТЗ бэкенда
  };

  ws.onopen = () => {
    console.log("Веб-сокет успешно подключен ✅");
    status = "connected";
    reconnectAttempts = 0;
    clearReconnectTimeout();

    // Мгновенный пинг при открытии, чтобы сессия не сгорела сразу
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ action: "ping" }));
      console.log("Первичный пинг отправлен мгновенно ⚡");
    }

    // Запуск регулярного таймера (раз в 20 секунд)
    startActivityPingTimer();

    drainQueue();
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data) as WSBaseResponse<unknown>;

      // Любой пакет от сервера продлевает keep-alive
      startActivityPingTimer();

      logIncomingMessage(data);
      handlers.forEach((handler) => handler(data));
    } catch {
      console.warn("Получено сырое сообщение WS:", event.data);
    }
  };

  ws.onclose = (event) => {
    console.log("Веб-сокет закрыт ❌ Код:", event.code, "Причина:", event.reason);
    socket = null;

    if (activityPingInterval) {
      clearInterval(activityPingInterval);
      activityPingInterval = null;
    }

    if (manualClose) {
      status = "closed";
      console.log(
        "Соединение закрыто вручную через выход из аккаунта. Переподключение не требуется.",
      );
      return;
    }

    // Код 4004 = деактивация или удаление аккаунта
    if (event.code === 4004) {
      status = "closed";
      console.warn("Аккаунт деактивирован на сервере. Сбрасываем токены...");
      useAuthStore.getState().clearAccessToken();
      return;
    }

    // Код 4000 = закрытие старого соединения сервером по таймауту неактивности
    if (event.code === 4000) {
      console.log("Сервер закрыл устаревшее соединение. Запускаем переподключение...");
    }

    status = "reconnecting";
    scheduleReconnect();
  };

  ws.onerror = () => {
    console.error("Произошла ошибка веб-сокета. Принудительно закрываем для перезапуска.");
    ws.close();
  };
};

export const sendWSRequest = <TResponse>(
  action: string,
  payload: unknown,
  requestUid?: string,
): Promise<TResponse> => {
  const socket = getSocket();
  const request_uid = requestUid || uuidv4();

  const message = {
    action,
    request_uid,
    object: payload,
  };

  const promise = useWSRequestStore.getState().trackRequest<TResponse>(request_uid);

  if (!socket || socket.readyState !== WebSocket.OPEN) {
    logQueuedMessage(message);
    requestQueue.push(message);
    scheduleReconnect();
  } else {
    logOutgoingMessage(message);
    socket.send(JSON.stringify(message));
  }

  return promise;
};

const scheduleReconnect = () => {
  console.log("Текущий токен для проверки реконнекта: ", currentToken);

  if (!currentToken || currentToken === "null" || localStorage.getItem("isLoggedOut") === "true") {
    console.warn("Переподключение отменено: пользователь вышел из системы.");
    return;
  }

  clearReconnectTimeout();

  const delay = getReconnectDelay();
  console.log(`Повторное подключение к WS через ${delay} мс`);

  reconnectTimeout = setTimeout(() => {
    reconnectAttempts += 1;
    if (currentToken && currentToken !== "null") {
      connectWS(currentToken);
    }
  }, delay);
};

export const connectWS = (accessToken: string) => {
  console.log("Вызов connectWS с токеном: ", accessToken);

  // Защита от дублирующих подключений (React Strict Mode)
  if (
    socket &&
    currentToken === accessToken &&
    (status === "connecting" || status === "connected")
  ) {
    console.warn(
      "Соединение WS уже открыто или подключается с этим токеном. Пропускаем перезапуск.",
    );
    return;
  }

  manualClose = false;
  currentToken = accessToken;
  status = "connecting";

  clearReconnectTimeout();

  // Закрываем сокет только если токен реально изменился на другой
  if (socket && currentToken !== accessToken) {
    console.log("Токен изменился. Закрываем старое соединение.");
    socket.close();
    socket = null;
  }

  if (!socket) {
    const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL}/ws/chat`;
    console.log("Инициализируем новое WebSocket соединение по адресу:", wsUrl);
    socket = new WebSocket(wsUrl);
    attachHandlers(socket);
  }
};

export const disconnectWS = () => {
  console.log("Вызвана функция disconnectWS. Отключаем сокет вручную.");
  manualClose = true;
  clearReconnectTimeout();
  requestQueue = [];

  if (socket) {
    socket.close();
    socket = null;
  }

  if (activityPingInterval) {
    clearInterval(activityPingInterval);
    activityPingInterval = null;
  }

  currentToken = null;
  status = "closed";
};

export const getSocket = () => socket;
export const getWSStatus = () => status;
