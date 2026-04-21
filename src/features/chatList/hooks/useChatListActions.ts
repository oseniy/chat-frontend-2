import { useModalStore } from "@/entities/modals/model/useGlobalModalStore";

import { setChatList } from "../api/setChatList";
import { useChatListStore } from "../model/useChatListStore";

export const useChatListActions = () => {
  const { chatsByKey, upsertChat } = useChatListStore.getState();

  const openModal = useModalStore((s) => s.openModal);

  const toggleFavoriteAction = async (chatKey: string) => {
    const prev = chatsByKey[chatKey];
    if (!prev) return;

    useChatListStore.getState().patchChat(chatKey, {
      isFavorite: !prev.isFavorite,
    });

    const result = await setChatList({
      index: prev.id,
      is_favorite: !prev.isFavorite,
    });

    if (!result.success) {
      console.error(result.error);
      upsertChat(prev);
    }
  };

  const toggleReadStatusAction = async (chatKey: string) => {
    console.log("toggleReadStatusAction", chatKey);
  };

  const toggleMuteStatusAction = async (chatKey: string) => {
    const prev = chatsByKey[chatKey];
    if (!prev) return;

    useChatListStore.getState().patchChat(chatKey, {
      notificationsEnabled: !prev.notificationsEnabled,
    });

    try {
      await setChatList({
        index: prev.id,
        notifications: !prev.notificationsEnabled,
      });
    } catch {
      upsertChat(prev);
    }
  };

  const deleteChatAction = async (chatKey: string) => {
    openModal("deleteChat", { chatKey });
  };

  return {
    toggleFavoriteAction,
    toggleReadStatusAction,
    toggleMuteStatusAction,
    deleteChatAction,
  };
};
