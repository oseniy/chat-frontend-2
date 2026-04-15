import { useChatListStore } from "@/features/chatList/model/useChatListStore";
import { WSHandler } from "@/shared/api/ws/model/types";

import { UserPreviewDto } from "../../model/types";

type NewStatusUserObject = {
  is_online: boolean;
  user: UserPreviewDto & { was_online_at?: number };
};

export const handleNewStatusUser: WSHandler<NewStatusUserObject> = (data) => {
  if (data.status !== "OK" || !data.object) return;

  const { is_online, user } = data.object;
  if (!user?.uid) return;

  const chatListStore = useChatListStore.getState();
  const chat = Object.values(chatListStore.chatsByKey).find((c) => c.member.uid === user.uid);
  if (!chat) return;

  chatListStore.patchChat(chat.key, {
    member: {
      ...chat.member,
      is_online,
      was_online_at: user.was_online_at ?? chat.member.was_online_at,
    },
  });
};
