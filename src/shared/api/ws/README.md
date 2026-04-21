# WebSocket Infrastructure Documentation

Данная документация описывает архитектуру и правила работы с WebSocket-системой в приложении. Система построена на принципах **Request-Response (через Promises)** и **Event-Driven (через Pub/Sub)**.

## 📂 Структура файлов

- `shared/api/ws/wsClient.ts` — Низкоуровневый транспорт: управление соединением, жизненный цикл сокета, очередь (Queue).
- `shared/api/ws/wsHandlers.ts` — Глобальный роутер входящих событий: распределяет сообщения по доменным обработчикам.
- `shared/api/ws/model/wsRequest.store.ts` — Zustand-стор для отслеживания циклов "запрос-ответ" по `request_uid`.
- `shared/api/ws/model/types.ts` — Общие интерфейсы данных и статусов.
- `shared/providers/wsProvider.tsx` — React-обертка для синхронизации состояния авторизации с сокетом.

---

## 🏗 Основные механизмы

### 1. Управление жизненным циклом

Подключение и отключение сокета полностью автоматизировано и привязано к состоянию авторизации в `WSProvider`.

- **Подключение:** Происходит автоматически при наличии `accessToken`.
- **Отключение:** Происходит при логауте (удалении токена). Очередь запросов при этом очищается.
- **Реконнект:** Реализован в `wsClient.ts`. Использует стратегию **Exponential Backoff** (задержка увеличивается с каждой попыткой, максимум до 30 сек).

### 2. Request-Response (через Promises)

Функция `sendWSRequest` превращает асинхронный поток сокетов в привычные Promises.

- При отправке генерируется уникальный `request_uid`.
- Запрос регистрируется в `wsRequest.store.ts`.
- Когда сервер присылает ответ с тем же `request_uid`, Promise резолвится.

### 3. Очередь запросов (Offline Queue)

Реализована в `wsClient.ts` для поддержки работы в условиях плохого интернета.

- Если сокет не в состоянии `OPEN`, запросы сохраняются в `requestQueue`.
- Порядок отправки — **FIFO** (First In, First Out).
- Очередь автоматически "сливается" (`drainQueue`) в момент срабатывания `onopen`.

---

## 🚀 Как использовать

### 1. Отправка сообщений (Outbound)

Для отправки запросов, требующих подтверждения от сервера, используйте `sendWSRequest`. Она возвращает Promise с данными ответа.

```typescript
import { sendWSRequest } from "@/shared/api/ws/wsClient";

const sendMessage = async (chatKey: string, text: string) => {
  try {
    const response = await sendWSRequest<MessageType>("send_message", {
      chat_key: chatKey,
      text: text,
    });
  } catch (error) {
    console.error("Ошибка отправки (или очередь полна):", error);
  }
};
```

### 2. Подписка на входящие события (Inbound)

Для обработки событий, инициированных сервером (новые сообщения, статусы), используйте `registerWSHandler` в своих хуках или компонентах.

```typescript
import { registerWSHandler } from "@/shared/api/ws/wsHandlers";
import { WSHandler } from "@/shared/api/ws/model/types";

// Внутри useEffect компонента или хука
useEffect(() => {
  const handler: WSHandler<NewMessagePayload> = (data) => {};

  // Регистрируем обработчик для конкретного action
  const unsubscribe = registerWSHandler("new_message", handler);

  // Обязательно возвращаем функцию отписки
  return () => unsubscribe();
}, []);
```

### 3. Получение статуса соединения

Вы можете отслеживать статус сокета для отображения UI-индикаторов (например, плашка "Соединение...").

```typescript
import { getWSStatus } from "@/shared/api/ws/wsClient";

const status = getWSStatus(); // "idle" | "connecting" | "connected" | "reconnecting" | "closed"
```

---

## 🛠 Важные технические соглашения

1. **Strict Types:** Использование `any` запрещено. Входящие данные в обработчиках имеют тип `unknown`. Рекомендуется использовать **Zod** для валидации `data.object` внутри обработчика.
2. **Cleanup:** Всегда вызывайте `unsubscribe()`, возвращаемую из `registerWSHandler`, при размонтировании компонента, чтобы избежать утечек памяти и дублирования логики.
3. **FSD:**
   - API-функции для отправки (`например sendMessageWS`) располагайте в `entities/(название)/api`.
   - Хуки подписки на события (`use...WS`) располагайте в `features/(название)/lib`.

---

## ⚠️ Обработка ошибок

- Если сервер вернул ошибку в ответе, она придет в `data.status` внутри резолвнутого промиса (обработайте статус в бизнес-логике).
