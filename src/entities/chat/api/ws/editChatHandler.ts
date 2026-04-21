import { ChatObject } from "@/entities/chat/model/types";
import { useChatInfoStore } from "@/entities/chat/model/useChatInfoStore";
import { useChatListStore } from "@/features/chatList/model/useChatListStore";
import { WSHandler } from "@/shared/api/ws/model/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

export const handleEditChat: WSHandler = (data) => {
  if (data.status !== "OK" || !data.object) return;

  const obj = data.object as ChatObject;
  const chatKey = obj.chat_key;
  const avatarUrl = obj.avatar?.url ? `${API_BASE}${obj.avatar.url}` : null;

  useChatInfoStore.getState().patchChatInfo(chatKey, {
    title: obj.name,
    description: obj.description,
    type: obj.chat_type,
    avatar: avatarUrl,
  });

  const chatListStore = useChatListStore.getState();
  const currentChat = chatListStore.chatsByKey[chatKey];

  chatListStore.patchChat(chatKey, {
    title: obj.name,
    ...(currentChat
      ? {
          member: {
            ...currentChat.member,
            avatar_url: avatarUrl,
            avatar_webp_url: avatarUrl,
          },
        }
      : {}),
  });
};
