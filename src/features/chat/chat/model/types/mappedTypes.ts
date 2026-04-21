import { MessageBlock } from "../messageBlock/types";
import { CallInfo, ChatType, SendingStatus } from "./serverTypes";

export interface MappedChatMessage {
  id: number;
  uid: string;
  fromUser: MappedMessageUser;
  toUser: MappedMessageUser | null;
  content: string;
  repliedMessages: MappedRepliedMessage[];
  forwardedMessages: MappedForwardedMessage[];
  filesList: MappedMessageFile[];
  isNew: boolean;
  createdAt: number;
  blocks: MessageBlock[];
  updatedAt: number;
  chatId: string | null;
  chatKey: string;
  chatType: ChatType;
  isForwarded?: boolean;
  forwardedAuthors?: string[];
  avatar: string | null;
  forwardedChatId?: string | null;
  forwardedUid?: string | null;
  messageRtc: CallInfo | null;

  status?: SendingStatus;
  requestUid?: string;
}

export interface MappedMessageUser {
  uid: string;
  username: string;
  nickname: string;
  firstName: string;
  lastName: string;
  patronymic: string;
  avatar: string;
  avatarUrl: string;
  avatarWebp: string;
  avatarWebpUrl: string;
}

export interface MappedMessageFile {
  id: number;
  uid: string;
  file?: string | File;
  fileUrl: string;
  fileWebp: string | null;
  name?: string;
  fileWebpUrl: string | undefined;
  fileType: string | null;
  isNew?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface MappedRepliedMessage {
  id: number | null;
  uid: string;
  firstName: string;
  lastName: string;
  fromUserId: string;
  content: string;
  filesList: MappedMessageFile[];
}

export interface MappedForwardedMessage {
  avatarUrl: string;
  id: number;
  uid: string;
  fromUserId: string;
  content: string;
  filesList: MappedMessageFile[];
  firstName: string;
  lastName: string;
}
