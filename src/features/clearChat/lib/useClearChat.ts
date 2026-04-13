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

  const clearChatModalVariant =
    chatType === "public-channel" || chatType === "private-channel"
      ? ("channel" as const)
      : chatType === "public-group" || chatType === "private-group"
        ? ("group" as const)
        : ("chat" as const);

  const toastMessage =
    chatType === "public-channel" || chatType === "private-channel"
      ? "История канала удалена"
      : "История чата удалена";

  const confirmClear = useCallback(async () => {
    // Получаем состояние сторов напрямую в момент клика, чтобы избежать проблем с замыканиями
    const chatState = useChatStore.getState() as unknown as Record<string, unknown>;
    const activeId = chatState.activeChatId || chatState.chatId || chatState.id;

    const targetId = (chatId || activeId) as number | null;

    if (!targetId) {
      console.error("Не удалось найти ID чата для очистки");
      return;
    }

    setIsLoading(true);

    try {
      const result = await clearChat({ index: targetId });

      if (result.success) {
        const { chatsByKey, patchChat } = useChatListStore.getState();

        // Находим ключ чата для обновления в списке слева
        const chatKey = Object.keys(chatsByKey).find(
          (key) => (chatsByKey[key] as unknown as Record<string, unknown>).id === targetId,
        );

        if (chatKey && patchChat) {
          patchChat(chatKey, {
            lastMessage: null,
            unreadMessages: 0,
            unreadFiles: 0,
          });
        }

        // Очищаем текущее окно сообщений
        clearMessages();

        // Обновляем данные в React Query
        await queryClient.invalidateQueries({ queryKey: ["chats"] });
        await queryClient.invalidateQueries({ queryKey: ["messages", targetId] });

        closeModal();
        showToast(toastMessage, {
          mobile: "/icons/toast/checkMobile.svg",
          desktop: "/icons/toast/checkDesktop.svg",
        });
      }
    } catch (error) {
      console.error("Ошибка при очистке чата:", error);
    } finally {
      setIsLoading(false);
    }
    // Включаем зависимости, которые реально используются, чтобы линтер был доволен и логика работала
  }, [chatId, clearMessages, closeModal, queryClient, showToast, toastMessage]);

  return {
    isLoading,
    clearChatModalVariant,
    chatName,
    confirmClear,
  };
};
