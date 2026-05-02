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

  // Функции очистки стейта
  const clearMessages = useChatStore((s) => s.clearMessages);
  const clearMedia = useChatStore((s) => s.clearMedia);
  const clearFiles = useChatStore((s) => s.clearFiles);

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

  const confirmClear = useCallback(
    async (forAll: boolean) => {
      // ИСПРАВЛЕНО: Безопасное приведение типа через unknown для поиска ID
      const chatState = useChatStore.getState() as unknown as Record<string, unknown>;
      const activeId = (chatState.activeChatId || chatState.chatId || chatState.id) as
        | number
        | undefined;
      const targetId = (chatId || activeId) as number | null;

      if (!targetId) {
        console.error("Не удалось найти ID чата для очистки");
        return;
      }
      setIsLoading(true);

      const { chatsByKey } = useChatListStore.getState();
      const resolvedChatKey =
        chatKey ?? Object.keys(chatsByKey).find((key) => chatsByKey[key].id === chatId);

      try {
        if (forAll && resolvedChatKey) {
          await clearChatForAll(resolvedChatKey);
        } else {
          await clearChatForMe({ index: targetId });
        }

        if (resolvedChatKey) {
          useChatListStore.getState().patchChat(resolvedChatKey, {
            lastMessage: null,
            unreadMessages: 0,
            unreadFiles: 0,
          });
        }

        // Очищаем все вкладки визуально
        clearMessages();
        clearMedia();
        clearFiles();

        queryClient.invalidateQueries({ queryKey: ["chats"] });
        queryClient.invalidateQueries({ queryKey: ["messages", targetId] });

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
    [
      closeModal,
      showToast,
      toastMessage,
      clearMessages,
      clearMedia,
      clearFiles,
      chatId,
      chatKey,
      queryClient,
    ],
  );

  return {
    isLoading,
    clearChatModalVariant,
    chatName,
    confirmClear,
  };
};
