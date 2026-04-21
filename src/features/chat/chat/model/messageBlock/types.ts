import { FileItem, MediaItem } from "@/shared/ui/mediaGrid/mediaGrid";

import { MappedMessageFile } from "../types/mappedTypes";

export type MessageBlock =
  | ReplyBlock
  | ForwardedBlock
  | TextBlock
  | FileBlock
  | MediaBlock
  | InviteLinkBlock
  | AudioBlock;

export type ReplyBlock = {
  type: "reply";
  messageUid: string;
  authorName: string;
  content: string;
  filesList: MappedMessageFile[];
};

export type ForwardedBlock = {
  type: "forwarded";
  authorName: string;
  chatKey: string;
  content: string;
  filesList: MappedMessageFile[];
  avatarUrl: string;
};

export type TextBlock = {
  type: "text";
  text: string;
};

export type FileBlock = {
  type: "file";
  items: FileItem[];
};

export type MediaBlock = {
  type: "media";
  items: MediaItem[];
};

export type InviteLinkBlock = {
  type: "inviteLink";
  chatKey: string;
  token: string;
};

export type AudioBlock = {
  type: "audio";
  item: MediaItem[];
};
