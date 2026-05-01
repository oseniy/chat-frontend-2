import { z } from "zod";

import { ChatMemberDto } from "@/entities/user/model/types";

import {
  ChatParticipantDtoSchema,
  ChatParticipantListResponseDtoSchema,
} from "./participantSchema";

export type ChatType =
  | "public-group"
  | "private-group"
  | "public-channel"
  | "private-channel"
  | "chat";

export type ChatTypeLight = "chat" | "channel" | "group";

export interface LastMessageCallInfo {
  uid: string;
  duration: number;
  status: string;
  created_at: number;
  updated_at: number;
}

export interface LastMessage {
  id: number;
  uid: string;
  from_user: string;
  content: string;
  files_summary?: {
    types: string[];
    count: number;
  } | null;
  has_replied_message?: boolean;
  has_forwarded_message?: boolean;
  new?: boolean;
  created_at: number;
  updated_at: number;
  message_rtc?: LastMessageCallInfo | null;
}

export type ChatObject = {
  chat_id: string;
  chat_key: string;
  name: string;
  description: string;
  chat_type: ChatType;
  created_by: string;
  owner_full_name: string;
  avatar: {
    filename: string;
    url: string;
  } | null;
  added_users: Array<{
    uid: string;
    full_name: string;
  }>;
  remove_users: Array<{
    uid: string;
    full_name: string;
  }>;
};

export interface ChatListItemDto {
  id: number;
  chat: ChatMemberDto;
  is_favorite: boolean;
  notifications: boolean;
  new_message_count: number;
  new_file_count: number;
  name: string;
  chat_type: ChatType;
  chat_key: string;
  last_activity_at: number;
  last_message: LastMessage | null;
  avatar_url?: string | null;
  avatar_webp_url?: string | null;
}

export interface ChatListResponseDto {
  count: number;
  next: string | null;
  previous: string | null;
  results: ChatListItemDto[];
}

export interface ChatListItem {
  id: number;
  key: string;
  title: string;
  type: ChatType;

  isFavorite: boolean;
  notificationsEnabled: boolean;

  unreadMessages: number;
  unreadFiles: number;

  lastActivityAt: number;
  lastMessage: LastMessage | null;

  avatar: {
    jpg?: string | null;
    webp?: string | null;
  };

  member: ChatMemberDto;
}

export type MessageStatus = "sent" | "delivered" | "pending";

export type FilesSummary = {
  types: string[];
  count: number;
};

export type PreviewIconType = "photo" | "video" | "file";

export type LastMessagePreview = {
  icons: PreviewIconType[];
  text: string;
};

export type GetLastMessagePreviewParams = {
  content?: string;
  files?: FilesSummary | null;
  call?: LastMessageCallInfo | null;
  isMine?: boolean;
};

// --- Типы участников чата (эндпоинт /participants/) ---

export type ChatParticipantDto = z.infer<typeof ChatParticipantDtoSchema>;
export type ChatParticipantListResponseDto = z.infer<typeof ChatParticipantListResponseDtoSchema>;

/** Участник группы/канала, маппированный в camelCase */
export type ChatParticipant = {
  uid: string;
  firstName: string;
  lastName: string;
  fullName: string;
  avatarUrl: string;
  avatarWebpUrl: string;
  isDeleted: boolean;
  isOwner: boolean;
  isBlocked: boolean;
  isOnline: boolean;
  lastSeenAt: number;
  isInContacts: boolean;
};

/** Маппированный ответ для пагинации участников */
export type ChatParticipantListResponse = {
  count: number;
  next: string | null;
  results: ChatParticipant[];
};

export type ChatPreviewDto = {
  name: string;
  description: string;
  participants_count: number;
  avatar_webp_url: string | null;
};

export type ChatPreview = {
  name: string;
  description: string;
  participantsCount: number;
  avatarUrl: string | null;
};
