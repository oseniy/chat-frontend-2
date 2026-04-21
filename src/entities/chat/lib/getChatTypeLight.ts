import { ChatTypeLight } from "@/entities/chat/model/types";

export const getChatTypeLight = (chatKey: string): ChatTypeLight => {
  if (chatKey.startsWith("group")) return "group";
  if (chatKey.startsWith("channel")) return "channel";
  return "chat";
};
