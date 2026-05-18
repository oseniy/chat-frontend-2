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
  // Изолированная функция управления таймером пинга (Задача #1)
  const startActivityPingTimer = () => {
    // Перед запуском всегда очищаем предыдущий интервал, чтобы они не дублировались в памяти
    if (activityPingInterval) {
      clearInterval(activityPingInterval);
    }

    activityPingInterval = setInterval(() => {
      if (ws.readyState !== WebSocket.OPEN) return;
      ws.send(JSON.stringify({ action: "ping" }));
    }, 20_000); // Строго 20 секунд (Пункт 5 требований бэкенда)
  };

  ws.onopen = () => {
    console.log("WS connected ✅");
    status = "connected";
    reconnectAttempts = 0;
    clearReconnectTimeout();

    // МГНОВЕННЫЙ ПИНГ: Отправляем сразу при открытии, чтобы Celery/Redis
    // не закрыли сессию по таймауту неактивности в первые секунды (Пункт 6 требований бэка)
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ action: "ping" }));
      console.log("Initial ping sent immediately ⚡");
    }

    // Запускаем регулярный Keep-Alive таймер на каждые 20 секунд
    startActivityPingTimer();

    drainQueue();
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data) as WSBaseResponse<unknown>;

      // Пункт 6 требований: Любой пакет от сервера (включая pong) продлевает keep-alive.
      // Перезапускаем 20-секундный таймер ожидания, чтобы не слать лишние пинги при живом общении.
      startActivityPingTimer();

      logIncomingMessage(data);
      handlers.forEach((handler) => handler(data));
    } catch {
      console.warn("WS raw message:", event.data);
    }
  };

  ws.onclose = (event) => {
    console.log("WS closed ❌", event.code, event.reason);
    socket = null;

    // Обязательно очищаем таймер, чтобы предотвратить утечки памяти в браузере
    if (activityPingInterval) {
      clearInterval(activityPingInterval);
      activityPingInterval = null;
    }

    if (manualClose) {
      status = "closed";
      return;
    }

    // Пункт 6 требований: Close code 4004 = деактивация или удаление аккаунта.
    // Принудительно останавливаем реконнект и стираем токен в Zustand.
    if (event.code === 4004) {
      status = "closed";
      console.warn("Account deactivated. Resetting token...");
      useAuthStore.getState().clearAccessToken();
      return;
    }

    // Пункт 6 требований: Close code 4000 = закрытие stale соединения по таймауту неактивности
    if (event.code === 4000) {
      console.log("Stale connection closed by server. Initiating reconnect...");
    }

    if (!navigator.onLine) {
      status = "reconnecting";
      scheduleReconnect();
      return;
    }

    status = "reconnecting";
    scheduleReconnect();
  };

  ws.onerror = () => {
    // onerror почти бесполезен → инициируем close, чтобы гарантированно попасть в onclose
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

  // Регистрируем ожидание ответа в сторе
  const promise = useWSRequestStore.getState().trackRequest<TResponse>(request_uid);

  // Проверяем состояние сокета перед отправкой
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
  console.log("currentToken from connectWS: ", currentToken);
  if (!currentToken) return;

  clearReconnectTimeout();

  const delay = getReconnectDelay();
  console.log(`WS reconnect in ${delay}ms`);

  reconnectTimeout = setTimeout(() => {
    reconnectAttempts += 1;
    connectWS(currentToken!);
  }, delay);
};

export const connectWS = (accessToken: string) => {
  console.log("accessToken from connectWS: ", accessToken);

  // Защита от дублирующих подключений
  if (
    socket &&
    currentToken === accessToken &&
    (status === "connecting" || status === "connected")
  ) {
    return;
  }

  manualClose = false;
  currentToken = accessToken;
  status = "connecting";

  clearReconnectTimeout();

  if (socket) {
    socket.close();
    socket = null;
  }

  // Финальный чистый URL. Авторизация пойдет через HttpOnly куку ws_access_token.
  const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL}/ws/chat`;
  socket = new WebSocket(wsUrl);

  attachHandlers(socket);
};

export const disconnectWS = () => {
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
