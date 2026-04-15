import { removeParticipantsFromCache } from "@/entities/chat/lib/participantsCache";
import { useChatInfoStore } from "@/entities/chat/model/useChatInfoStore";
import { getQueryClient } from "@/shared/api/getQueryClient";
import { WSHandler } from "@/shared/api/ws/model/types";

type LeaveChatResponseObject = {
  chat_key: string;
  left_user: { uid: string; full_name: string };
};

export const handleLeaveChat: WSHandler = (data) => {
  if (data.status !== "OK" || !data.object) return;

  const obj = data.object as LeaveChatResponseObject;
  const chatKey = obj.chat_key;
  const leftUser = obj.left_user;

  if (!leftUser) return;

  removeParticipantsFromCache(chatKey, [leftUser.uid]);
  getQueryClient().invalidateQueries({ queryKey: ["participants", chatKey] });

  const store = useChatInfoStore.getState();
  const existing = store.chatInfoByKey[chatKey];
  if (!existing) return;

  store.patchChatInfo(chatKey, {
    membersCount: existing.membersCount - 1,
    members: existing.members.filter((m) => m.uid != leftUser.uid),
  });
};
