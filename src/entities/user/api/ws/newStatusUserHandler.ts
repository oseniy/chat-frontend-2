import { useContactStore } from "@/entities/contact/model/store";
import { useChatListStore } from "@/features/chatList/model/useChatListStore";
import { getQueryClient } from "@/shared/api/getQueryClient";
import { WSHandler } from "@/shared/api/ws/model/types";
import { getChatKeyFromPath } from "@/shared/lib/getChatKeyFromPath";

import { UserPreviewDto } from "../../model/types";

type NewStatusUserObject = {
  is_online: boolean;
  user: UserPreviewDto & { was_online_at?: number };
};

export const handleNewStatusUser: WSHandler = (data) => {
  if (data.status !== "OK" || !data.object) return;

  const { is_online, user } = data.object as NewStatusUserObject;
  if (!user?.uid) return;

  const path = window.location.pathname;
  const chatKey = getChatKeyFromPath(path);
  const chatListStore = useChatListStore.getState();
  const chat = Object.values(chatListStore.chatsByKey).find((c) => c.member.uid === user.uid);
  if (chat) {
    chatListStore.patchChat(chat.key, {
      member: {
        ...chat.member,
        is_online,
        was_online_at: user.was_online_at ?? chat.member.was_online_at,
      },
    });
  }
  getQueryClient().invalidateQueries({ queryKey: ["participants", chatKey] });
  getQueryClient().invalidateQueries({ queryKey: ["contacts"] });

  useContactStore.getState().updateContact(user.uid, {
    isOnline: is_online,
    ...(user.was_online_at !== undefined && { was_online_at: user.was_online_at }),
  });
};
