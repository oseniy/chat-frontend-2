import { ChatListItem } from "@/entities/chat/model/types";

export const filterChats = (chats: ChatListItem[], search: string) => {
  const q = search.trim().toLowerCase();
  // if (!q) return chats;
  return chats.filter((chat) => {
    if (chat.title?.toLowerCase().includes(q)) return true;
    if (chat.member) {
      const { first_name, last_name } = chat.member;
      const fullName = `${first_name ?? ""} ${last_name ?? ""}`.trim();
      if (fullName.toLowerCase().includes(q)) return true;
    }
    if (chat.lastMessage?.content?.toLowerCase().includes(q)) return true;
    return false;
  });
};
