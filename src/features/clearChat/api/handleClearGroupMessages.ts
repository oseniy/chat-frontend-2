import { ChatObject } from "@/entities/chat/model/types";
import { useChatStore } from "@/entities/chat/model/useChatStore";
import { useChatListStore } from "@/features/chatList/model/useChatListStore";
import { WSHandler } from "@/shared/api/ws/model/types";

export const handleClearGroupMessages: WSHandler = (data) => {
  if (data.status !== "OK" || !data.object) return;

  const obj = data.object as ChatObject;
  const chatKey = obj.chat_key;

  const chatListStore = useChatListStore.getState();

  if (chatListStore.chatsByKey[chatKey]) {
    chatListStore.patchChat(chatKey, {
      lastMessage: null,
      unreadMessages: 0,
      unreadFiles: 0,
    });
  }

  const chatStore = useChatStore.getState();
  if (chatStore.chatKey === chatKey) {
    chatStore.clearMessages();
  }
};
