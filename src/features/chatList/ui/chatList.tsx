"use client";

import Link from "next/link";

import { ChatListItem } from "@/entities/chat/model/types";
import { useChatStore } from "@/entities/chat/model/useChatStore";
import { Button } from "@/shared/shadcn/ui/button";
import { InfoMessage } from "@/shared/ui/infoMessage";

import { useChatListActions } from "../hooks/useChatListActions";
import { ChatListItemComponent } from "./chatListItem";

interface ChatListProps {
  className?: string;
  chats: ChatListItem[];
  isSearch?: boolean;
}

export const ChatList: React.FC<ChatListProps> = ({ chats, isSearch }) => {
  const { chatKey, clearForwardTargets, clearReplyTarget, exitSelectionMode } = useChatStore(
    (s) => s,
  );

  const actions = useChatListActions();

  console.log(chats);
  return (
    <>
      {chats.length > 0 ? (
        chats.map((chat) => (
          <ChatListItemComponent
            actions={{
              toggleFavorite: () => actions.toggleFavoriteAction(chat.key),
              toggleMuteStatus: () => actions.toggleMuteStatusAction(chat.key),
              deleteChat: () => actions.deleteChatAction(chat.key),
              toggleReadStatus: () => actions.toggleReadStatusAction(chat.key),
            }}
            className="last:after:hidden"
            key={chat.id}
            onClick={() => {
              clearForwardTargets();
              clearReplyTarget();
              exitSelectionMode();
            }}
            chat={chat}
            isActive={chat.key === chatKey || chat.member.uid === chatKey}
            isLast={chat.id === chats[chats.length - 1].id}
          />
        ))
      ) : (
        <div className="flex flex-1 justify-center px-2 pt-40">
          {!isSearch && (
            <div className="flex w-full flex-col items-center">
              <InfoMessage
                imgSrc="/info/chatsNotExist.svg"
                title="У вас пока нет чатов"
                description="Начните общение и здесь всё появится"
              />
              <Button asChild variant="default" size="lg" className="mt-10 w-full">
                <Link href="/contacts">Начать чат</Link>
              </Button>
            </div>
          )}
          {isSearch && (
            <InfoMessage
              imgSrc="/info/chatNotFound.svg"
              title="Поиск не дал результатов"
              description="По вашему запросу ничего не найдено. Измените запрос и попробуйте снова"
            />
          )}
        </div>
      )}
    </>
  );
};
