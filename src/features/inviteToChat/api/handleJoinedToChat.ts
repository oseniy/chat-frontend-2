import { ChatObject } from "@/entities/chat/model/types";
import { useChatInfoStore } from "@/entities/chat/model/useChatInfoStore";
import { WSHandler } from "@/shared/api/ws/model/types";

export const handleJoinedToChat: WSHandler = (data) => {
  if (data.status !== "OK" || !data.object) return;

  const obj = data.object as ChatObject;
  const chatKey = obj.chat_key;
  const addedUsers = obj.added_users ?? [];

  if (addedUsers.length === 0) return;

  const store = useChatInfoStore.getState();
  const existing = store.chatInfoByKey[chatKey];
  if (!existing) return;

  const newMembers = addedUsers.map((u) => ({ uid: u.uid, name: u.full_name }));

  store.patchChatInfo(chatKey, {
    membersCount: existing.membersCount + addedUsers.length,
    members: [...existing.members, ...newMembers],
  });
};
