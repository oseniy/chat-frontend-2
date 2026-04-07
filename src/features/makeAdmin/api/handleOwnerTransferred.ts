import { InfiniteData } from "@tanstack/react-query";

import { getChatTypeLight } from "@/entities/chat/lib/getChatTypeLight";
import { ChatParticipantListResponse } from "@/entities/chat/model/types";
import { useChatInfoStore } from "@/entities/chat/model/useChatInfoStore";
import { useChatStore } from "@/entities/chat/model/useChatStore";
import { useParticipantsStore } from "@/entities/chat/model/useParticipantsStore";
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

  const participantsState = useParticipantsStore.getState();
  participantsState.participants.forEach((p) => {
    if (p.uid === newOwner.uid) {
      useParticipantsStore.getState().updateParticipant(p.uid, { isOwner: true });
    } else if (p.isOwner) {
      useParticipantsStore.getState().updateParticipant(p.uid, { isOwner: false });
    }
  });

  const queryClient = getQueryClient();
  queryClient.setQueryData(
    ["participants", chatKey],
    (oldData: InfiniteData<ChatParticipantListResponse> | undefined) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        pages: oldData.pages.map((page) => ({
          ...page,
          results: page.results.map((p) => ({
            ...p,
            is_owner: p.uid === newOwner.uid,
          })),
        })),
      };
    },
  );
  queryClient.invalidateQueries({ queryKey: ["participants", chatKey] });

  const chatType = getChatTypeLight(chatKey);
  if (chatType === "channel") {
    const chatState = useChatStore.getState();
    if (chatState.chatKey === chatKey) {
      useChatStore.setState({ createdBy: newOwner.uid });
    }
  }
};
