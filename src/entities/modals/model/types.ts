import { ChatPreview } from "@/entities/chat/model/types";

export type ModalPayloads = {
  deleteChat: { chatKey: string };
  deleteMessage: { messageId: string; chatKey: string; chatKeyUser?: string };
  leaveChat: {
    chatName: string;
    modalVariant: "channel" | "public-group" | "private-group";
    onConfirm: () => void;
  };
  deleteChatGlobal: {
    chatName: string;
    modalVariant: "group" | "channel";
    onConfirm: () => void;
  };
  clearChat: {
    chatName: string;
    modalVariant: "channel" | "group" | "chat";
    onConfirm: () => void;
  };
  sendImage: { chatKey: string };
  sendFile: { chatKey: string };
  forward: { chatKey: string };
  removeParticipant: {
    participantName: string;
    chatKey: string;
    participantUid: string;
  };
  chatPreview: {
    chatKey: string;
    token: string;
    previewData: ChatPreview;
  };
  makeAdmin: {
    participantName: string;
    chatKey: string;
    participantUid: string;
  };
  //новые модалки здесь
};

export type ModalType = keyof ModalPayloads;
