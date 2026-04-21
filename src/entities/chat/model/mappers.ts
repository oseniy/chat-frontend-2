import { ChatPreview, ChatPreviewDto } from "../model/types";
import { ChatListItem, ChatListItemDto } from "./types";

export const mapChatListItem = (dto: ChatListItemDto): ChatListItem => ({
  id: dto.id,
  key: dto.chat_key,
  title: dto.name,
  type: dto.chat_type,

  isFavorite: dto.is_favorite,
  notificationsEnabled: dto.notifications,

  unreadMessages: dto.new_message_count,
  unreadFiles: dto.new_file_count,

  lastActivityAt: dto.last_activity_at,
  lastMessage: dto.last_message,

  avatar: {
    jpg: dto.avatar_url,
    webp: dto.avatar_webp_url,
  },

  member: dto.chat,
});

export const mapChatList = (dtos: ChatListItemDto[]) => dtos.map(mapChatListItem);

export const mapChatPreview = (dto: ChatPreviewDto): ChatPreview => ({
  name: dto.name,
  description: dto.description,
  participantsCount: dto.participants_count,
  avatarUrl: dto.avatar_webp_url,
});
