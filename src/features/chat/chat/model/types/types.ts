import { MappedChatMessage } from "./mappedTypes";

export type MessageGroupType = {
  id: string;
  date: string;
  label: string;
  messages: MappedChatMessage[];
};

export type BasePendingAttachment = {
  file: File;

  previewUrl?: string;
  title?: string;
  weight?: number;
  duration?: number;
};
