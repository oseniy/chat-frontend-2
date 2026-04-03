import { InfiniteData } from "@tanstack/react-query";

import { ChatObject, ChatParticipantListResponse } from "@/entities/chat/model/types";
import { useChatInfoStore } from "@/entities/chat/model/useChatInfoStore";
import { useParticipantsStore } from "@/entities/chat/model/useParticipantsStore";
import { useUserStore } from "@/entities/user/model/userStore";
import { useChatListStore } from "@/features/chatList/model/useChatListStore";
import { getQueryClient } from "@/shared/api/getQueryClient";
import { WSHandler } from "@/shared/api/ws/model/types";

export const handleInviteToChat: WSHandler = (data) => {
  if (data.status !== "OK" || !data.object) return;

  const obj = data.object as ChatObject;
  const chatKey = obj.chat_key;
  const addedUsers = obj.added_users ?? [];

  if (addedUsers.length === 0) return;

  const currentUserId = useUserStore.getState().userId;
  const isSelfAdded = currentUserId && addedUsers.some((u) => u.uid === currentUserId);

  if (isSelfAdded) {
    useChatInfoStore.getState().removeChatInfo(chatKey);

    const queryClient = getQueryClient();
    queryClient.removeQueries({ queryKey: ["chat-messages", chatKey] });
    queryClient.removeQueries({ queryKey: ["participants", chatKey] });

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
  useParticipantsStore.getState().addParticipants(newParticipants);

  const queryClient = getQueryClient();
  queryClient.setQueryData(
    ["participants", chatKey],
    (oldData: InfiniteData<ChatParticipantListResponse> | undefined) => {
      if (!oldData) return oldData;
      const [firstPage, ...restPages] = oldData.pages;

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
  queryClient.invalidateQueries({ queryKey: ["participants", chatKey] });
};
