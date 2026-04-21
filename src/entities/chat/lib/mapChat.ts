import { ChatType } from "@/features/chat/chat/model/types/serverTypes";

import { ChatDetails } from "../model/schema";

/**
 * Интерфейс, который будет использовать фронтенд (UI)
 */
export interface MappedChatDetails {
  id: number;
  uid: string;
  title: string;
  chatKey: string;
  type: ChatType;
  description: string;
  avatar: string | null;
  unreadCount: number;
  totalMessages: number;
  lastMessage: {
    text: string;
    sender: string;
    createdAt: number;
    hasFiles: boolean;
  } | null;
  membersCount: number;
  members: Array<{
    uid: string;
    name: string;
  }>;
  isFavorite: boolean;
  createdBy: string;
  isNotificationsEnabled: boolean;
}

/**
 * Функция-маппер
 */
export const mapChatDetails = (raw: ChatDetails): MappedChatDetails => {
  // 1. Используем let и обычный if вместо тернарного оператора.
  // Это самый надежный способ избежать проблем с отступами.
  let lastMessageData: MappedChatDetails["lastMessage"] = null;

  if (raw.last_message) {
    lastMessageData = {
      text: raw.last_message.content,
      sender: raw.last_message.from_user,
      createdAt: raw.last_message.created_at,
      hasFiles: raw.last_message.files_list.length > 0,
    };
  }

  // 2. Возвращаем объект
  return {
    id: raw.id,
    uid: raw.chat.uid,
    title: raw.name,
    chatKey: raw.chat_key,
    type: raw.chat_type as ChatType,
    description: raw.description || "",
    avatar: raw.chat.avatar_url,

    unreadCount: raw.new_message_count,
    totalMessages: raw.message_count,

    lastMessage: lastMessageData,

    membersCount: raw.participants.length,
    members: raw.participants.map((p) => ({
      uid: p.uid,
      name: p.full_name,
    })),

    createdBy: raw.created_by,

    isFavorite: raw.is_favorite,
    isNotificationsEnabled: raw.notifications,
  };
};
