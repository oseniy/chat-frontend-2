import { ChatObject } from "@/entities/chat/model/types";
import { useChatListStore } from "@/features/chatList/model/useChatListStore";
import { WSHandler } from "@/shared/api/ws/model/types";

export const handleDeleteChat: WSHandler = (data) => {
  console.log("зашли в обработчик");

  if (data.status !== "OK" || !data.object) return;
  console.log("прошли первый иф");
  const obj = data.object as ChatObject;
  const chatKey = obj.chat_key;

  const chatListStore = useChatListStore.getState();

  if (!chatListStore.chatsByKey[chatKey]) return;
  console.log("прошли второй иф");
  chatListStore.removeChat(chatKey);

  if (window.location.pathname.includes(`/chats/${chatKey}`)) {
    console.log("прошли третий иф");
    window.location.href = "/chats";
  }
};
