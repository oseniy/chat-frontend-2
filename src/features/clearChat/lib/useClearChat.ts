"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";

import { clearChatForMe } from "@/entities/chat/api/clearChatForMe";
import { clearChatForAll } from "@/entities/chat/api/ws/clearChatForAll";
import { ChatType } from "@/entities/chat/model/types";
import { useChatStore } from "@/entities/chat/model/useChatStore";
import { useModalStore } from "@/entities/modals/model/useGlobalModalStore";
import { useChatListStore } from "@/features/chatList/model/useChatListStore";
import { useToast } from "@/shared/toast/ui/toastProvider";

type UseClearChatParams = {
  chatId: number | null;
  chatKey: string | null;
  chatName: string;
  chatType: ChatType;
};

export const useClearChat = ({ chatId, chatKey, chatName, chatType }: UseClearChatParams) => {
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
    async (forAll: boolean) => {
      const chatState = useChatStore.getState() as unknown as Record<string, unknown>;
      const activeId = chatState.activeChatId || chatState.chatId || chatState.id;

      const targetId = (chatId || activeId) as number | null;

      if (!targetId) {
        console.error("Не удалось найти ID чата для очистки");
        return;
      }
      setIsLoading(true);

      // Получаем chatKey из store для optimistic update
      const { chatsByKey } = useChatListStore.getState();
      const resolvedChatKey =
        chatKey ?? Object.keys(chatsByKey).find((key) => chatsByKey[key].id === chatId);

      try {
        if (forAll && resolvedChatKey) {
          await clearChatForAll(resolvedChatKey);
        } else {
          // API запрос на очистку только для себя
          await clearChatForMe({ index: chatId });
        }

        // Optimistic update - мгновенное обновление UI
        if (resolvedChatKey) {
          useChatListStore.getState().patchChat(resolvedChatKey, {
            lastMessage: null,
            unreadMessages: 0,
            unreadFiles: 0,
          });
        }

        // Очищаем сообщения в открытом окне чата
        clearMessages();

        // Invalidate для фоновой перезагрузки (гарантия актуальности)
        queryClient.invalidateQueries({ queryKey: ["chats"] });
        queryClient.invalidateQueries({ queryKey: ["messages", targetId] });

        // Закрываем модалку и показываем успех
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
    },
    [closeModal, showToast, toastMessage, clearMessages, chatId, chatKey, queryClient],
  );

  return {
    isLoading,
    clearChatModalVariant,
    chatName,
    confirmClear,
  };
};
