import { ChatType } from "@/features/chat/chat/model/types/serverTypes";

import { getGroupChannel } from "./getGroupChannel";
import { getUserByUID } from "./getUserByUID";

export const getChat = async (chatKey: string, chatType: "group" | "channel" | "chat") => {
  if (chatType === "group" || chatType === "channel") {
    const groupRes = await getGroupChannel(chatKey);
    if (groupRes.success) {
      return { data: groupRes.data, success: true as const, type: groupRes.data.type };
    }

    return groupRes;
  }

  const privateRes = await getUserByUID(chatKey);
  if (privateRes.success) {
    return { data: privateRes.data, success: true as const, type: "chat" as ChatType };
  }
  return privateRes;
};
