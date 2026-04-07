export interface UserProfile {
  uid: string;
  username: string;
  nickname: string;
  first_name: string;
  last_name: string;
  patronymic: string;
  avatar: string;
  avatar_url: string;
  avatar_webp: string;
  avatar_webp_url: string;
}

export interface MessageFile {
  id: number;
  uid: string;
  file: string | File;
  file_url: string;
  file_webp?: string | null;
  name?: string;
  file_webp_url?: string;
  file_type?: string | null;
  new: boolean;
  created_at: number;
  updated_at: number;
}

export interface RepliedMessage {
  id: number;
  uid: string;
  from_user: string;
  first_name: string;
  last_name: string;
  content: string;
  files_list: MessageFile[];
}

export interface ForwardedMessage {
  id: number;
  uid: string;
  from_user: string;
  avatar: string;
  avatar_webp_url: string | null;
  content: string;
  files_list: MessageFile[];
  first_name: string;
  last_name: string;
}

export interface CallInfo {
  uid: string;
  duration: number;
  status: string;
  created_at: number;
  updated_at: number;
}

export interface ChatMessage {
  id: number | null;
  uid: string;
  from_user: UserProfile;
  to_user: UserProfile | null;
  content: string;
  replied_messages: RepliedMessage[];
  forwarded_messages: ForwardedMessage[];
  files_list: MessageFile[];
  new: boolean;
  created_at: number;
  updated_at: number;
  chat_id: string;
  chat_key: string;
  chat_type: string;
  message_rtc?: CallInfo | null;
}

export interface ChatMessageUI extends ChatMessage {
  status?: SendingStatus;
  request_uid?: string;
}

export type SendingStatus = "pending" | "delivered" | "failed" | "read";

export interface ChatMessageList {
  count: number;
  next?: string | null;
  previous?: string | null;
  results: ChatMessage[];
}

export type ChatType =
  | "public-group"
  | "private-group"
  | "public-channel"
  | "private-channel"
  | "chat";

export interface Participant {
  uid: string;
  full_name: string;
}

export interface Chat {
  chat: UserProfile;
  id: number;
  is_active: boolean;
  is_favorite: boolean;
  notifications: boolean;
  index?: number;
  message_count: number;
  file_count: number;
  new_message_count: number;
  new_file_count: number;
  last_message?: ChatMessage;
  last_seen_message?: RepliedMessage;
  first_new_message?: RepliedMessage;
  name: string;
  chat_type: ChatType;
  chat_key: string;
  description: string;
  created_by: string;
  owner_full_name: string;
  participants: Participant[];
  created_at: string;
  updated_at: string;
}
