"use client";

import { useEffect, useRef } from "react";

import { useChatStore } from "@/entities/chat/model/useChatStore";
import { useUserStore } from "@/entities/user/model/userStore";
import { cn } from "@/shared/shadcn/lib/utils";
import { Button } from "@/shared/shadcn/ui/button";
import { ChatFooter } from "@/widgets/chat/chatFooter/ui/chatFooter";

import { useSendMessage } from "../hooks";
import { useChatMessagesInfinite } from "../hooks/useChatMessagesInfinite";
import { mapChatMessages } from "../model/mapper";
import { useMessageNavigation } from "../model/store/useChatNavigationStore";
import { ChatType } from "../model/types/serverTypes";
import { MessageList } from "./messageList";

type ChatProps = {
  className?: string;
  chatType: ChatType;
  createdBy?: string;
  chatKey: string;
  chatUid: string;
  join?: boolean;
};

export const Chat = ({
  className,
  chatKey,
  chatType,
  createdBy,
  chatUid,
  join = false,
}: ChatProps) => {
  const currentUserId = useUserStore((s) => s.userId);
  const reset = useChatStore((s) => s.reset);
  const setInitialData = useChatStore((s) => s.setInitialData);
  const prependMessages = useChatStore((s) => s.prependMessages);
  const { reset: resetNavigation } = useMessageNavigation();
  const messages = useChatStore((s) => s.messages);
  const isOwner = useChatStore((s) => s.createdBy === currentUserId);

  const handleSendMessage = useSendMessage();

  const {
    data,
    isSuccess,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    status,
  } = useChatMessagesInfinite(chatUid);

  const isInitializedRef = useRef(false);

  useEffect(() => {
    reset();
    resetNavigation();
    useChatStore.setState((state) => ({ ...state, chatKey: chatKey }));
  }, [chatUid]);

  useEffect(() => {
    if (!currentUserId || isInitializedRef.current) return;

    if (isError) {
      const chatKeyUser = null;
      setInitialData([], currentUserId, chatKey, chatType, createdBy, chatKeyUser, chatUid);
      isInitializedRef.current = true;
      return;
    }

    if (!isSuccess || !data) {
      return;
    }

    if (!data.pages || data.pages.length === 0) {
      return;
    }

    const firstPageMessages = data.pages[0]?.data?.results ?? [];

    const normalized = firstPageMessages.length > 0 ? mapChatMessages(firstPageMessages) : [];

    const chatKeyUser = normalized[0]?.chatKey || "";
    const chatId = normalized[0]?.chatId || null;
    setInitialData(
      normalized,
      currentUserId,
      chatKey,
      chatType,
      createdBy,
      chatKeyUser,
      chatUid,
      Number(chatId),
    );
    isInitializedRef.current = true;

    if (data.pages.length > 1) {
      const allOldMessages: ReturnType<typeof mapChatMessages> = [];

      for (let i = 1; i < data.pages.length; i++) {
        const pageMessages = data.pages[i]?.data?.results || [];
        if (pageMessages.length > 0) {
          const normalized = mapChatMessages(pageMessages);
          allOldMessages.push(...normalized);
        }
      }

      if (allOldMessages.length > 0) {
        prependMessages(allOldMessages);
      }
    }
  }, [
    currentUserId,
    isSuccess,
    isError,
    error,
    status,
    data,
    chatKey,
    chatType,
    createdBy,
    setInitialData,
    prependMessages,
  ]);

  useEffect(() => {
    if (!isInitializedRef.current || !data || data.pages.length <= 1) return;

    const existingUids = new Set(messages.map((m) => m.uid));
    let hasNewMessages = false;

    const allOldMessages: ReturnType<typeof mapChatMessages> = [];

    for (let i = 1; i < data.pages.length; i++) {
      const pageMessages = data.pages[i]?.data?.results || [];
      if (pageMessages.length > 0) {
        const normalized = mapChatMessages(pageMessages);
        const newInPage = normalized.some((msg) => !existingUids.has(msg.uid));
        if (newInPage) {
          hasNewMessages = true;
          allOldMessages.push(...normalized);
        }
      }
    }

    if (hasNewMessages && allOldMessages.length > 0) {
      prependMessages(allOldMessages);
    }
  }, [data, prependMessages, messages]);

  if (isError && !chatType) {
    return (
      <div className={cn("flex h-full flex-col", className)}>
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <p className="mb-2 text-red-500">Ошибка загрузки сообщений</p>
            <Button onClick={() => refetch()} size={"default"} variant={"default"}>
              Попробовать снова
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex h-full flex-col", className)}>
      <MessageList
        currentUserId={currentUserId || ""}
        className="flex-1"
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        loadedPages={data?.pages.length}
        isOwner={isOwner}
      />
      {((chatType != "public-channel" && chatType != "private-channel") || isOwner) && (
        <ChatFooter onSendMessage={handleSendMessage} join={join} />
      )}
    </div>
  );
};
