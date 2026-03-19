// wsClient.ts
import { v4 as uuidv4 } from "uuid";

import { QueuedRequest, WSBaseResponse, WSHandler, WSStatus } from "./model/types";
import { useWSRequestStore } from "./model/wsRequest.store";

let socket: WebSocket | null = null;
let currentToken: string | null = null;
let status: WSStatus = "idle";
const requestQueue: QueuedRequest[] = [];

let reconnectAttempts = 0;
let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
let manualClose = false;

const MAX_RECONNECT_DELAY = 30_000;
const handlers = new Set<WSHandler>();

// Интерфейс для типизации сообщения внутри функции
interface WSMessage {
  action: string;
  request_uid: string;
  object: unknown;
}

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
      socket.send(JSON.stringify(request));
    }
  }
};

const attachHandlers = (ws: WebSocket) => {
  ws.onopen = () => {
    console.warn("WS connected ✅");
    status = "connected";
    reconnectAttempts = 0;
    clearReconnectTimeout();
    drainQueue();
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data) as WSBaseResponse<unknown>;

      handlers.forEach((handler) => handler(data));
    } catch {
      console.warn("WS raw message:", event.data);
    }
  };

  ws.onclose = (event) => {
    console.warn("WS closed ❌", event.code, event.reason);
    socket = null;
    if (manualClose) {
      status = "closed";
      return;
    }
    status = "reconnecting";
    scheduleReconnect();
  };

  ws.onerror = () => {
    ws.close();
  };
};

/**
 * sendWSRequest: с защитой от двойной упаковки и логом
 */
export const sendWSRequest = <TResponse>(
  action: string,
  payload: unknown,
  requestUid?: string,
): Promise<TResponse & { request_uid: string }> => {
  const currentSocket = getSocket();
  const request_uid = requestUid || uuidv4();

  let message: WSMessage;

  // Type Guard для проверки "конверта"
  const isEnvelope = (p: unknown): p is WSMessage =>
    !!p && typeof p === "object" && "action" in p && "object" in p;

  if (isEnvelope(payload)) {
    // Если payload уже упакован, используем его структуру
    message = {
      action: (payload as WSMessage).action,
      request_uid: (payload as WSMessage).request_uid || request_uid,
      object: (payload as WSMessage).object,
    };
  } else {
    // Обычная упаковка в object
    message = {
      action,
      request_uid,
      object: payload,
    };
  }

  const promise = useWSRequestStore
    .getState()
    .trackRequest<TResponse & { request_uid: string }>(request_uid);

  if (!currentSocket || currentSocket.readyState !== WebSocket.OPEN) {
    console.warn(`⏳ WS: Socket not ready. Queuing action: ${action}`);
    // Приведение к типу очереди (QueuedRequest обычно совпадает с WSMessage)
    requestQueue.push(message as unknown as QueuedRequest);
  } else {
    currentSocket.send(JSON.stringify(message));
  }

  return promise;
};

const scheduleReconnect = () => {
  if (!currentToken) return;
  clearReconnectTimeout();
  const delay = getReconnectDelay();
  reconnectTimeout = setTimeout(() => {
    reconnectAttempts += 1;
    connectWS(currentToken!);
  }, delay);
};

export const connectWS = (accessToken: string) => {
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
  const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL}/ws/chat?authorization=${accessToken}`;
  socket = new WebSocket(wsUrl);
  attachHandlers(socket);
};

export const disconnectWS = () => {
  manualClose = true;
  clearReconnectTimeout();
  // Очистка очереди при дисконнекте
  requestQueue.length = 0;
  if (socket) {
    socket.close();
    socket = null;
  }
  currentToken = null;
  status = "closed";
};

export const getSocket = () => socket;
export const getWSStatus = () => status;
