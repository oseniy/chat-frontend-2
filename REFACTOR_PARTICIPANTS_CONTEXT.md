# Контекст для рефакторинга: убрать дублирование Query → Zustand для участников чата

## Цель

Удалить `useParticipantsStore` (Zustand) и сделать React Query (`useParticipantsQuery`) **единственным источником правды** для списка участников чата. Это закроет замечание ревьюера: сейчас данные хранятся в двух местах, что ведёт к рискам рассинхрона (рефетч может затирать WS-мутации, race при смене чата, пагинация может затирать оптимистичные изменения).

## Текущая архитектура (что есть сейчас)

### Хранилища

- **Query**: `useParticipantsQuery(chatKey, initialData?)` — `useInfiniteQuery` с `queryKey: ["participants", chatKey]`, `staleTime: 60s`. Файл: [src/entities/chat/lib/useParticipantsQuery.ts](src/entities/chat/lib/useParticipantsQuery.ts).
- **Zustand**: `useParticipantsStore` — хранит `participants: ChatParticipant[]`, `count`, `isInitialized`, плюс экшены `setParticipants`, `addParticipants`, `updateParticipant`, `removeParticipants`, `reset`. Файл: [src/entities/chat/model/useParticipantsStore.ts](src/entities/chat/model/useParticipantsStore.ts).
- **Слой синка**: `useParticipantsSync(chatKey, initialData?)` — вызывает Query и в `useEffect` копирует `data.pages.flatMap(...)` в Zustand через `setParticipants`; при смене `chatKey` вызывает `reset()`. Файл: [src/entities/chat/lib/useParticipantsSync.ts](src/entities/chat/lib/useParticipantsSync.ts).

### Тип данных

```ts
// src/entities/chat/model/types.ts:128
export type ChatParticipant = {
  uid: string;
  firstName: string;
  lastName: string;
  fullName: string;
  avatarUrl: string;
  avatarWebpUrl: string;
  isDeleted: boolean;
  isOwner: boolean; // camelCase
  isBlocked: boolean;
  isOnline: boolean;
  lastSeenAt: number;
  isInContacts: boolean;
};

export type ChatParticipantListResponse = {
  count: number;
  next: string | null;
  results: ChatParticipant[];
};
```

Query хранит `InfiniteData<ChatParticipantListResponse>` — `{ pages: ChatParticipantListResponse[], pageParams: ... }`.

### Потребители стора (читают `useParticipantsStore`)

1. [src/widgets/anothersProfile/ui/tabs/participantsPage.tsx:36](src/widgets/anothersProfile/ui/tabs/participantsPage.tsx#L36) — `participants` для отрисовки списка участников.
2. [src/widgets/anothersProfile/ui/sections/invitePage.tsx:29](src/widgets/anothersProfile/ui/sections/invitePage.tsx#L29) — `participants` чтобы построить `Set` `participantUids` и отфильтровать своих контактов, которых уже добавили.

Оба компонента сейчас делают так:

```tsx
const { fetchNextPage, hasNextPage, isFetchingNextPage } = useParticipantsSync(
  chatKey,
  initialParticipants,
);
const participants = useParticipantsStore((s) => s.participants);
```

`InvitePage` НЕ вызывает `useParticipantsSync` сам — он опирается на то, что `ParticipantsPage` (родительский таб) уже его вызвал. Это нужно учесть при рефакторинге: либо вынести `useParticipants(chatKey)` в общее место и звать в обоих компонентах, либо оставить инициализацию в одном.

### Мутации (кто пишет в стор / в кэш)

Все WS-хендлеры **уже пишут И в Zustand, И в Query cache** (через `queryClient.setQueryData`) + ещё и `invalidateQueries`. Это значит: после удаления Zustand нужно просто оставить запись в Query cache.

| Файл                                                                                                                                       | Что делает                                                                                                                          | Уже пишет в Query?      |
| ------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| [src/features/inviteToChat/api/handleInviteToChat.ts:66-88](src/features/inviteToChat/api/handleInviteToChat.ts#L66)                       | `addParticipants` + `setQueryData` (добавляет в **первую** страницу) + `invalidateQueries`                                          | да                      |
| [src/features/joinToChat/api/handleJoinedToChat.ts:67-89](src/features/joinToChat/api/handleJoinedToChat.ts#L67)                           | `addParticipants([newParticipant])` + `setQueryData` (добавляет в первую страницу) + `invalidateQueries`                            | да                      |
| [src/features/removeParticipant/api/handleRemoveParticipants.ts:37-62](src/features/removeParticipant/api/handleRemoveParticipants.ts#L37) | `removeParticipants` + `setQueryData` (фильтрует все страницы, уменьшает count в первой)                                            | да, без invalidate      |
| [src/features/leaveChat/api/handleLeaveChat.ts:23-49](src/features/leaveChat/api/handleLeaveChat.ts#L23)                                   | `removeParticipants([leftUser.uid])` + `setQueryData` + `invalidateQueries`                                                         | да                      |
| [src/features/makeAdmin/api/handleOwnerTransferred.ts:30-56](src/features/makeAdmin/api/handleOwnerTransferred.ts#L30)                     | `updateParticipant(...isOwner)` + `setQueryData` (⚠️ **БАГ**: пишет `is_owner` в snake_case вместо `isOwner`) + `invalidateQueries` | да, но с багом          |
| [src/features/removeParticipant/lib/useRemoveParticipant.ts:39-40](src/features/removeParticipant/lib/useRemoveParticipant.ts#L39)         | `removeParticipants([participantUid])` + `invalidateQueries` (без `setQueryData` для оптимистичного UI)                             | нет — только invalidate |

⚠️ **Важно при рефакторинге исправить**:

- `handleOwnerTransferred` пишет `is_owner` — должен быть `isOwner` (тип `ChatParticipant` использует camelCase).
- `useRemoveParticipant` теряет оптимистичность, если убрать Zustand — нужно добавить `setQueryData` для мгновенного исчезновения карточки до ответа сервера.

### Доступ к queryClient

Singleton: [src/shared/api/getQueryClient.ts](src/shared/api/getQueryClient.ts) — экспортирует `getQueryClient()` (возвращает один и тот же `QueryClient`). Уже импортируется во всех WS-хендлерах. В React-хуках используется `useQueryClient()` из `@tanstack/react-query`.

### Передача initialData

`ParticipantsPage` принимает `initialParticipants: ChatParticipantListResponse | null` пропом и передаёт в `useParticipantsSync` → `useParticipantsQuery`. Это SSR/RSC данные, чтобы первая отрисовка была мгновенной. Сохранить эту цепочку.

## План рефакторинга

1. **Создать новый хук** `useParticipants(chatKey, initialData?)` в [src/entities/chat/lib/](src/entities/chat/lib/) — обёртка над `useParticipantsQuery`, возвращающая:

   ```ts
   { participants: ChatParticipant[], count: number, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isInitialized }
   ```

   - `participants = data?.pages.flatMap(p => p.results) ?? []`
   - `count = data?.pages[0]?.count ?? 0`
   - `isInitialized = !isLoading && data !== undefined`

2. **Создать утилиты мутации кэша** в `src/entities/chat/lib/participantsCache.ts`:

   ```ts
   addParticipantsToCache(chatKey, items: ChatParticipant[])
   removeParticipantsFromCache(chatKey, uids: string[])
   updateParticipantInCache(chatKey, uid: string, patch: Partial<ChatParticipant>)
   ```

   Каждая вызывает `getQueryClient().setQueryData(["participants", chatKey], (old) => ...)` с правильной обработкой `InfiniteData` (см. примеры в текущих хендлерах). При добавлении — фильтровать дубли по `uid`. При удалении — корректировать `count` только в первой странице.

3. **Переписать всех потребителей**:
   - [participantsPage.tsx](src/widgets/anothersProfile/ui/tabs/participantsPage.tsx) — заменить `useParticipantsSync` + `useParticipantsStore` на `useParticipants(chatKey, initialParticipants)`.
   - [invitePage.tsx](src/widgets/anothersProfile/ui/sections/invitePage.tsx) — то же, но без `initialData` (либо вызвать тот же `useParticipants(chatKey)` — Query вернёт уже закэшированные данные, потому что queryKey совпадает).

4. **Переписать WS-хендлеры**: убрать вызовы `useParticipantsStore.getState().*`, оставить только вызовы новых утилит + `invalidateQueries`. Файлы:
   - [handleInviteToChat.ts](src/features/inviteToChat/api/handleInviteToChat.ts)
   - [handleJoinedToChat.ts](src/features/joinToChat/api/handleJoinedToChat.ts)
   - [handleRemoveParticipants.ts](src/features/removeParticipant/api/handleRemoveParticipants.ts)
   - [handleLeaveChat.ts](src/features/leaveChat/api/handleLeaveChat.ts)
   - [handleOwnerTransferred.ts](src/features/makeAdmin/api/handleOwnerTransferred.ts) — **+ исправить `is_owner` → `isOwner`**
   - [useRemoveParticipant.ts](src/features/removeParticipant/lib/useRemoveParticipant.ts) — **+ добавить оптимистичный `removeParticipantsFromCache` перед запросом**

5. **Удалить файлы**:
   - [src/entities/chat/lib/useParticipantsSync.ts](src/entities/chat/lib/useParticipantsSync.ts)
   - [src/entities/chat/model/useParticipantsStore.ts](src/entities/chat/model/useParticipantsStore.ts)

6. **Перепроверить нет ли других импортов** через `grep "useParticipantsStore\|useParticipantsSync"`.

## Тонкие моменты, на которые наступишь

- **`InvitePage` без `useParticipantsSync`**: сейчас он работает только потому, что `ParticipantsPage` рядом уже залил данные в Zustand. После рефакторинга: если `InvitePage` вызовет `useParticipants(chatKey)`, Query отдаст данные из кэша мгновенно (queryKey тот же). Если кэша нет — пойдёт запрос. Это ОК и даже лучше текущего поведения.
- **`reset()` на смене chatKey**: больше не нужен, потому что смена `chatKey` меняет `queryKey` и Query сам отдаёт правильные данные.
- **`isInitialized`**: используется в `useInvitePageLogic` для логики «список пуст ИЛИ ещё грузится». Эквивалент в Query: `!isLoading && data !== undefined` или `isSuccess`.
- **invalidate vs setQueryData**: после `setQueryData` сразу делать `invalidateQueries` — это форсит запрос к серверу для сверки. Сейчас так и делается (кроме `handleRemoveParticipants`). Можно оставить как есть для надёжности; это не вызовет «затирания», потому что мутации уже сохранены в кэш и сервер вернёт актуальные данные.
- **Бэкенд возвращает с пагинацией**: если добавляем участника в конец первой страницы, а у пользователя загружено 3 страницы — дубль появится при следующей загрузке/refetch. `invalidateQueries` решает это, перезагружая весь набор. Стоит оценить, лучше ли добавлять в **последнюю** страницу или просто звать `invalidateQueries` без `setQueryData` для add-кейсов (тогда теряется мгновенность).

## Verification

1. `pnpm tsc --noEmit` — типы.
2. `pnpm build` — продакшн-сборка.
3. UI проверки в браузере:
   - Открыть группу → виден список участников (SSR initialData работает).
   - Пригласить участника → появился в списке. Через минуту/после refresh focus — не пропал.
   - Удалить участника (как владелец) → исчез мгновенно (оптимистично), не вернулся после серверного ответа и invalidate.
   - Передать владение → корона/«Владелец» переехали на нового. Старый — обычный участник.
   - Покинуть чат другим юзером (через два аккаунта) → исчез из списка через WS.
   - Быстро переключаться между чатами → нет мигания пустого списка для уже посещённых чатов; новые загружаются нормально.
   - Открыть `InvitePage` → свои контакты, которые уже в чате, скрыты. После приглашения нового — он сразу скрывается из списка.

## Файлы для чтения перед началом работы

- [src/entities/chat/lib/useParticipantsQuery.ts](src/entities/chat/lib/useParticipantsQuery.ts)
- [src/entities/chat/lib/useParticipantsSync.ts](src/entities/chat/lib/useParticipantsSync.ts)
- [src/entities/chat/model/useParticipantsStore.ts](src/entities/chat/model/useParticipantsStore.ts)
- [src/entities/chat/model/types.ts](src/entities/chat/model/types.ts) (`ChatParticipant`, `ChatParticipantListResponse`)
- [src/widgets/anothersProfile/ui/tabs/participantsPage.tsx](src/widgets/anothersProfile/ui/tabs/participantsPage.tsx)
- [src/widgets/anothersProfile/ui/sections/invitePage.tsx](src/widgets/anothersProfile/ui/sections/invitePage.tsx)
- [src/widgets/anothersProfile/lib/useInvitePageLogic.ts](src/widgets/anothersProfile/lib/useInvitePageLogic.ts)
- Все 6 WS-хендлеров из таблицы выше.
- [src/shared/api/getQueryClient.ts](src/shared/api/getQueryClient.ts)
