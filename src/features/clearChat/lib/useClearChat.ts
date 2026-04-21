"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";

import { clearChat } from "@/entities/chat/api/clearChat";
import { ChatType } from "@/entities/chat/model/types";
import { useChatStore } from "@/entities/chat/model/useChatStore";
import { useModalStore } from "@/entities/modals/model/useGlobalModalStore";
import { useChatListStore } from "@/features/chatList/model/useChatListStore";
import { useToast } from "@/shared/toast/ui/toastProvider";

type UseClearChatParams = {
  chatId: number | null;
  chatName: string;
  chatType: ChatType;
};

export const useClearChat = ({ chatId, chatName, chatType }: UseClearChatParams) => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const closeModal = useModalStore((s) => s.closeModal);

  // Добавляем методы очистки медиа и файлов из стора
  const clearMessages = useChatStore((s) => s.clearMessages);
  //закомментировал, может сделаем позже
  // const clearMedia = useChatStore((s) => s.clearMedia);
  // const clearFiles = useChatStore((s) => s.clearFiles);

  const [isLoading, setIsLoading] = useState(false);

  // Определение варианта модалки
  const clearChatModalVariant =
    chatType === "public-channel" || chatType === "private-channel"
      ? ("channel" as const)
      : chatType === "public-group" || chatType === "private-group"
        ? ("group" as const)
        : ("chat" as const);

  // Определение текста Toast
  const toastMessage =
    chatType === "public-channel" || chatType === "private-channel"
      ? "История канала удалена"
      : "История чата удалена";

  const confirmClear = useCallback(async () => {
    setIsLoading(true);

    const { chatsByKey } = useChatListStore.getState();
    const chatKey = Object.keys(chatsByKey).find((key) => chatsByKey[key].id === chatId);

    try {
      // 1. API запрос на очистку
      await clearChat({ index: chatId });

      // 2. Optimistic update
      if (chatKey) {
        useChatListStore.getState().patchChat(chatKey, {
          lastMessage: null,
          unreadMessages: 0,
          unreadFiles: 0,
        });
      }

      // // 3. Очищаем сообщения, медиа и файлы в сторе мгновенно
      // clearMessages();
      // clearMedia();
      // clearFiles();

      // 4. Invalidate для фоновой перезагрузки
      queryClient.invalidateQueries({ queryKey: ["chats"] });

      // 5. Закрываем модалку и показываем успех
      closeModal();
      showToast(toastMessage, {
        mobile: "/icons/toast/checkMobile.svg",
        desktop: "/icons/toast/checkDesktop.svg",
      });
    } catch (error) {
      console.error("Ошибка при очистке чата:", error);
    } finally {
      setIsLoading(false);
    }
  }, [closeModal, showToast, toastMessage, clearMessages, chatId, queryClient]);

  return {
    isLoading,
    clearChatModalVariant,
    chatName,
    confirmClear,
  };
};
