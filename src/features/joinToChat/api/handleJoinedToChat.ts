import { addParticipantsToCache } from "@/entities/chat/lib/participantsCache";
import { useChatInfoStore } from "@/entities/chat/model/useChatInfoStore";
import { useUserStore } from "@/entities/user/model/userStore";
import { getQueryClient } from "@/shared/api/getQueryClient";
import { WSHandler } from "@/shared/api/ws/model/types";

type MemberAddedObject = {
  chat_key: string;
  chat_type: string;
  joined_user: {
    uid: string;
    full_name: string;
  };
};

export const handleJoinedToChat: WSHandler = (data) => {
  if (data.status !== "OK" || !data.object) return;

  const obj = data.object as MemberAddedObject;
  const chatKey = obj.chat_key;
  const joinedUser = obj.joined_user;

  if (!joinedUser) return;

  const currentUserId = useUserStore.getState().userId;
  const isSelfJoined = currentUserId && joinedUser.uid === currentUserId;

  if (isSelfJoined) {
    useChatInfoStore.getState().removeChatInfo(chatKey);

    const queryClient = getQueryClient();
    queryClient.removeQueries({ queryKey: ["chat-messages", chatKey] });
    queryClient.removeQueries({ queryKey: ["participants", chatKey] });

    return;
  }

  const store = useChatInfoStore.getState();
  const existing = store.chatInfoByKey[chatKey];
  if (!existing) return;

  store.patchChatInfo(chatKey, {
    membersCount: existing.membersCount + 1,
    members: [...existing.members, { uid: joinedUser.uid, name: joinedUser.full_name }],
  });

  const [firstName = "", ...rest] = joinedUser.full_name.trim().split(" ");
  const lastName = rest.join(" ");
  const newParticipant = {
    uid: joinedUser.uid,
    firstName,
    lastName,
    fullName: joinedUser.full_name,
    avatarUrl: "",
    avatarWebpUrl: "",
    isDeleted: false,
    isOwner: false,
    isBlocked: false,
    isOnline: false,
    lastSeenAt: 0,
    isInContacts: false,
  };

  addParticipantsToCache(chatKey, [newParticipant]);
  getQueryClient().invalidateQueries({ queryKey: ["participants", chatKey] });
};
