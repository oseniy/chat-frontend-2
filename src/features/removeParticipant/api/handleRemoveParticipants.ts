import { InfiniteData } from "@tanstack/react-query";

import { ChatObject, ChatParticipantListResponse } from "@/entities/chat/model/types";
import { useChatInfoStore } from "@/entities/chat/model/useChatInfoStore";
import { useParticipantsStore } from "@/entities/chat/model/useParticipantsStore";
import { getQueryClient } from "@/shared/api/getQueryClient";
import { WSHandler } from "@/shared/api/ws/model/types";

export const handleRemoveParticipants: WSHandler = (data) => {
  if (data.status !== "OK" || !data.object) return;

  const obj = data.object as ChatObject;
  const chatKey = obj.chat_key;
  const removedUsers = obj.remove_users ?? [];

  if (removedUsers.length === 0) return;

  const removedUids = removedUsers.map((u) => u.uid);

  useParticipantsStore.getState().removeParticipants(removedUids);

  const store = useChatInfoStore.getState();
  const existing = store.chatInfoByKey[chatKey];
  if (!existing) return;

  store.patchChatInfo(chatKey, {
    membersCount: existing.membersCount - removedUsers.length,
    members: existing.members.filter((m) => !removedUids.includes(m.uid)),
  });

  const queryClient = getQueryClient();
  queryClient.setQueryData(
    ["participants", chatKey],
    (oldData: InfiniteData<ChatParticipantListResponse> | undefined) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        pages: oldData.pages.map((page, i) => ({
          ...page,
          count: i === 0 ? Math.max(0, page.count - removedUsers.length) : page.count,
          results: page.results.filter((p) => !removedUids.includes(p.uid)),
        })),
      };
    },
  );
};
