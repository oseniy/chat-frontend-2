import { getChatTypeLight } from "@/entities/chat/lib/getChatTypeLight";
import { updateParticipantsInCache } from "@/entities/chat/lib/participantsCache";
import { useChatInfoStore } from "@/entities/chat/model/useChatInfoStore";
import { useChatStore } from "@/entities/chat/model/useChatStore";
import { getQueryClient } from "@/shared/api/getQueryClient";
import { WSHandler } from "@/shared/api/ws/model/types";

type OwnerTransferredObject = {
  chat_key: string;
  new_owner: { uid: string; full_name: string };
};

export const handleOwnerTransferred: WSHandler = (data) => {
  if (data.status !== "OK" || !data.object) return;

  const obj = data.object as OwnerTransferredObject;
  const { chat_key: chatKey, new_owner: newOwner } = obj;

  if (!newOwner) return;

  const store = useChatInfoStore.getState();
  const existing = store.chatInfoByKey[chatKey];
  if (existing) {
    store.patchChatInfo(chatKey, { createdBy: newOwner.uid });
  }

  updateParticipantsInCache(chatKey, (p) => ({ ...p, isOwner: p.uid === newOwner.uid }));
  getQueryClient().invalidateQueries({ queryKey: ["participants", chatKey] });

  const chatType = getChatTypeLight(chatKey);
  if (chatType === "channel") {
    const chatState = useChatStore.getState();
    if (chatState.chatKey === chatKey) {
      useChatStore.setState({ createdBy: newOwner.uid });
    }
  }
};
