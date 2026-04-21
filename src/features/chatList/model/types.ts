import { ChatListItem } from "@/entities/chat/model/types";
import { ChatType } from "@/entities/chat/model/types";

export type ChatListState = {
  chats: ChatListItem[];
  count: number;
  next: string | null;
  isLoading: boolean;
  error: string | null;
};
export type ChatActions = {
  toggleReadStatus: (chatId: number) => void;
  deleteChat: (chatId: number) => Promise<void>;
  toggleFavorite: (chatId: number) => Promise<void>;
  toggleMuteStatus: (chatId: number) => Promise<void>;
};

export interface WSCreateChatDto {
  chat_key: string;
  chat_id: string;
  name: string;
  description?: string;
  chat_type: ChatType;
  avatar?: {
    url: string;
    filename: string;
  };
  created_by: string;
  owner_full_name: string;
  added_users: {
    uid: string;
    full_name: string;
  }[];
}
