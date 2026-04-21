import { ChatList } from "./chatList";
import { ChatListDataProvider } from "./chatListProvider";

type Props = {
  search: string;
};

export const ChatListContainer = ({ search }: Props) => {
  const isSearch = search ? true : false;
  return (
    <div className="flex flex-col">
      <ChatListDataProvider search={search}>
        {({ chats, isLoading, isError, loadMoreRef, isFetchingNextPage }) => {
          if (isLoading) return <div className="p-4 text-center">Загрузка чатов...</div>;
          if (isError) return <div className="p-4 text-center text-red-500">Ошибка загрузки</div>;

          return (
            <>
              <ChatList chats={chats} isSearch={isSearch} />
              <div ref={loadMoreRef} />
              {isFetchingNextPage && (
                <div className="p-2 text-center text-sm opacity-60">Загрузка...</div>
              )}
            </>
          );
        }}
      </ChatListDataProvider>
    </div>
  );
};
