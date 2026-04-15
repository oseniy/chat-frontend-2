import { removeParticipantsFromCache } from "@/entities/chat/lib/participantsCache";
import { ChatObject } from "@/entities/chat/model/types";
import { useChatInfoStore } from "@/entities/chat/model/useChatInfoStore";
import { useUserStore } from "@/entities/user/model/userStore";
import { useChatListStore } from "@/features/chatList/model/useChatListStore";
import { WSHandler } from "@/shared/api/ws/model/types";

export const handleRemoveParticipants: WSHandler = (data) => {
  if (data.status !== "OK" || !data.object) return;

  const obj = data.object as ChatObject;
  const chatKey = obj.chat_key;
  const removedUsers = obj.remove_users ?? [];

  if (removedUsers.length === 0) return;

  const removedUids = removedUsers.map((u) => u.uid);

  const currentUserId = useUserStore.getState().userId;
  const isSelfRemoved = currentUserId && removedUids.includes(currentUserId);

  if (isSelfRemoved) {
    const chatListStore = useChatListStore.getState();
    if (chatListStore.chatsByKey[chatKey]) {
      chatListStore.removeChat(chatKey);
    }

    if (window.location.pathname.includes(`/chats/${chatKey}`)) {
      window.location.href = "/chats";
    }
    return;
  }

  removeParticipantsFromCache(chatKey, removedUids);

  const store = useChatInfoStore.getState();
  const existing = store.chatInfoByKey[chatKey];
  if (!existing) return;

  store.patchChatInfo(chatKey, {
    membersCount: existing.membersCount - removedUsers.length,
    members: existing.members.filter((m) => !removedUids.includes(m.uid)),
  });
};
