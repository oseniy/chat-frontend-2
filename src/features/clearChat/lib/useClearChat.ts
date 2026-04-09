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
  const clearMessages = useChatStore((s) => s.clearMessages);

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

  const confirmClear = useCallback(
    async (explicitId?: unknown) => {
      // Если передали ID напрямую (из меню) — берем его, иначе из пропсов хука
      const targetId = typeof explicitId === "number" ? explicitId : chatId;

      if (targetId === null || targetId === undefined) {
        console.error("ClearChat Error: chatId is null");
        return;
      }

      setIsLoading(true);

      try {
        // 1. API запрос на очистку
        const result = await clearChat({ index: targetId });

        if (result.success) {
          // 2. Optimistic update
          const { chatsByKey } = useChatListStore.getState();
          const chatKey = Object.keys(chatsByKey).find((key) => chatsByKey[key].id === targetId);

          if (chatKey) {
            useChatListStore.getState().patchChat(chatKey, {
              lastMessage: null,
              unreadMessages: 0,
              unreadFiles: 0,
            });
          }

          // 3. Очищаем сообщения
          clearMessages();

          // 4. Инвалидация кеша
          await queryClient.invalidateQueries({ queryKey: ["chats"] });
          await queryClient.invalidateQueries({ queryKey: ["messages", targetId] });

          // 5. Закрываем модалку и успех
          closeModal();
          showToast(toastMessage, {
            mobile: "/icons/toast/checkMobile.svg",
            desktop: "/icons/toast/checkDesktop.svg",
          });
        } else {
          console.error("Server returned error:", result.error);
        }
      } catch (error) {
        console.error("Network or Logic error:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [closeModal, showToast, toastMessage, clearMessages, chatId, queryClient],
  );

  return {
    isLoading,
    clearChatModalVariant,
    chatName,
    confirmClear,
  };
};
