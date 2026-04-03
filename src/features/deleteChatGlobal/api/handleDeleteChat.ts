import { ChatObject } from "@/entities/chat/model/types";
import { useChatListStore } from "@/features/chatList/model/useChatListStore";
import { WSHandler } from "@/shared/api/ws/model/types";

export const handleDeleteChat: WSHandler = (data) => {
  if (data.status !== "OK" || !data.object) return;

  const obj = data.object as ChatObject;
  const chatKey = obj.chat_key;

  const chatListStore = useChatListStore.getState();

  if (!chatListStore.chatsByKey[chatKey]) return;

  chatListStore.removeChat(chatKey);
};
