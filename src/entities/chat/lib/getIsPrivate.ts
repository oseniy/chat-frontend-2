import { ChatType } from "@/entities/chat/model/types";

export const getIsPrivate = (chatType: ChatType): boolean => {
  return chatType === "private-group" || chatType === "private-channel";
};
