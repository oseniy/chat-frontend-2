import { InfiniteData } from "@tanstack/react-query";

import { ChatObject, ChatParticipantListResponse } from "@/entities/chat/model/types";
import { useChatInfoStore } from "@/entities/chat/model/useChatInfoStore";
import { useParticipantsStore } from "@/entities/chat/model/useParticipantsStore";
import { useUserStore } from "@/entities/user/model/userStore";
import { useChatListStore } from "@/features/chatList/model/useChatListStore";
import { getQueryClient } from "@/shared/api/getQueryClient";
import { WSHandler } from "@/shared/api/ws/model/types";

export const handleInviteToChat: WSHandler = (data) => {
  console.warn("[WS handleInviteToChat] Получено WS-сообщение:", JSON.stringify(data));
  if (data.status !== "OK" || !data.object) return;

  const obj = data.object as ChatObject;
  const chatKey = obj.chat_key;
  const addedUsers = obj.added_users ?? [];
  console.warn(
    "[WS handleInviteToChat] chatKey:",
    chatKey,
    "addedUsers uids:",
    addedUsers.map((u) => u.uid),
  );

  if (addedUsers.length === 0) return;

  const currentUserId = useUserStore.getState().userId;
  const isSelfAdded = currentUserId && addedUsers.some((u) => u.uid === currentUserId);

  if (isSelfAdded) {
    const chatListStore = useChatListStore.getState();
    if (!chatListStore.chatsByKey[chatKey]) {
      chatListStore.addNewChat(chatKey);
    }
    return;
  }

  const store = useChatInfoStore.getState();
  const existing = store.chatInfoByKey[chatKey];
  if (!existing) return;

  const newMembers = addedUsers.map((u) => ({ uid: u.uid, name: u.full_name }));

  store.patchChatInfo(chatKey, {
    membersCount: existing.membersCount + addedUsers.length,
    members: [...existing.members, ...newMembers],
  });

  const newParticipants = addedUsers.map((u) => {
    const [firstName = "", ...rest] = u.full_name.trim().split(" ");
    const lastName = rest.join(" ");
    return {
      uid: u.uid,
      firstName,
      lastName,
      fullName: u.full_name,
      avatarUrl: "",
      avatarWebpUrl: "",
      isDeleted: false,
      isOwner: false,
      isBlocked: false,
      isOnline: false,
      lastSeenAt: 0,
      isInContacts: false,
    };
  });
  console.warn(
    "[WS handleInviteToChat] Добавляю в zustand store, uids:",
    newParticipants.map((p) => p.uid),
  );
  console.warn(
    "[WS handleInviteToChat] Текущие участники в store:",
    useParticipantsStore.getState().participants.map((p) => p.uid),
  );
  useParticipantsStore.getState().addParticipants(newParticipants);

  const queryClient = getQueryClient();
  console.warn("[WS handleInviteToChat] Обновляю query cache для chatKey:", chatKey);
  queryClient.setQueryData(
    ["participants", chatKey],
    (oldData: InfiniteData<ChatParticipantListResponse> | undefined) => {
      if (!oldData) return oldData;
      const [firstPage, ...restPages] = oldData.pages;
      const existingUids = firstPage?.results?.map((r) => r.uid) ?? [];
      console.warn(
        "[WS handleInviteToChat] setQueryData — existing uids:",
        existingUids,
        "adding uids:",
        newParticipants.map((p) => p.uid),
      );
      return {
        ...oldData,
        pages: [
          {
            ...firstPage,
            count: (firstPage?.count ?? 0) + newParticipants.length,
            results: [...(firstPage?.results ?? []), ...newParticipants],
          },
          ...restPages,
        ],
      };
    },
  );
  console.warn("[WS handleInviteToChat] Инвалидирую query cache");
  queryClient.invalidateQueries({ queryKey: ["participants", chatKey] });
};
