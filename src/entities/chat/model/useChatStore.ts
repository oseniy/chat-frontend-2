import { create } from "zustand";

import { getChatFiles } from "@/entities/chat/api/getChatFiles";
import { MappedChatMessage, MappedMessageFile } from "@/features/chat/chat/model/types/mappedTypes";
import { MESSAGE_STATUS } from "@/shared/constants/constants";

import { getChatMedia } from "../api/getChatMedia";
import { ChatType } from "./types";

interface ChatState {
  messages: MappedChatMessage[];
  currentUserId: string | null;
  chatKey: string | null;
  chatType: ChatType | null;
  createdBy: string | null;
  media: MappedMessageFile[];
  isLoadingMedia: boolean;
  isMediaLoaded: boolean;
  files: MappedMessageFile[];
  isLoadingFiles: boolean;
  isFilesLoaded: boolean;
  chatUid: string | null;
  isReady: boolean;
  isHide: boolean;
  chatKeyUser: string | null;
  chatId: number | null;
  replyTarget: MappedChatMessage | null;
  forwardTargets: MappedChatMessage[];
  fetchMedia: (chatKey: string) => Promise<void>;
  fetchFiles: (chatKey: string) => Promise<void>;
  setReplyTarget: (message: MappedChatMessage | null) => void;
  setForwardTargets: (messages: MappedChatMessage[]) => void;
  isSelectionMode: boolean;
  selectedMessageUids: Set<string>;
  isVoiceRecord: boolean;
  enterVoiceRecord: () => void;
  exitVoiceRecord: () => void;
  enterSelectionMode: (uid?: string) => void;
  toggleMessageSelection: (uid: string) => void;
  exitSelectionMode: () => void;
  deleteMessage: (uid: string) => void;
  setInitialData: (
    messages: MappedChatMessage[],
    currentUserId: string,
    chatKey: string,
    chatType: ChatType,
    createdBy?: string,
    chatKeyUser?: string | null,
    chatUid?: string,
    chatId?: number,
  ) => void;
  prependMessages: (messages: MappedChatMessage[]) => void;
  addMessage: (message: MappedChatMessage) => void;
  updateMessageStatus: (uid: string, status: MappedChatMessage["status"]) => void;
  markAsRead: (uid: string) => void;
  setFailedStatus: (requestUid: string) => void;
  clearMessages: () => void;
  clearForwardTargets: () => void;
  clearReplyTarget: () => void;
  clearMedia: () => void;
  clearFiles: () => void;
  reset: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  currentUserId: null,
  chatKey: null,
  chatUid: null,
  isReady: false,
  chatId: null,
  isLoadingMedia: false,
  isMediaLoaded: false,
  media: [],
  files: [],
  isLoadingFiles: false,
  isFilesLoaded: false,
  isHide: false,
  replyTarget: null,
  forwardTargets: [],
  chatType: null,
  createdBy: null,
  isVoiceRecord: false,
  chatKeyUser: null,
  isSelectionMode: false,
  selectedMessageUids: new Set(),

  enterSelectionMode: (uid) =>
    set(() => ({ isSelectionMode: true, selectedMessageUids: uid ? new Set([uid]) : new Set() })),
  enterVoiceRecord: () => set({ isVoiceRecord: true }),
  exitVoiceRecord: () => set({ isVoiceRecord: false }),
  toggleMessageSelection: (uid) =>
    set((state) => {
      const next = new Set(state.selectedMessageUids);
      if (next.has(uid)) {
        next.delete(uid);
      } else {
        next.add(uid);
      }
      return { selectedMessageUids: next, isSelectionMode: next.size > 0 };
    }),
  fetchMedia: async (chatKey: string) => {
    if (!chatKey) return;
    set({ isLoadingMedia: true });
    try {
      const data = await getChatMedia(chatKey);

      // Заменяем any на Record<string, unknown>, чтобы удовлетворить линтер
      const imagesOnly = (data as unknown as Record<string, unknown>[])
        .filter((file) => {
          const type = (file.file_type || file.fileType) as string | undefined;
          return type?.startsWith("image/");
        })
        .map((file) => ({
          ...file,
          fileType: (file.file_type || file.fileType || "image/jpeg") as string,
          fileUrl: (file.file_url || file.fileUrl || "") as string,
        })) as unknown as MappedMessageFile[];

      set({ media: imagesOnly, isLoadingMedia: false, isMediaLoaded: true });
    } catch {
      set({ isLoadingMedia: false, isMediaLoaded: false });
    }
  },
  fetchFiles: async (chatKey) => {
    if (!chatKey) return;
    set({ isLoadingFiles: true, isFilesLoaded: false });
    try {
      const data = await getChatFiles(chatKey);
      set({ files: data, isLoadingFiles: false, isFilesLoaded: true });
    } catch {
      set({ isLoadingFiles: false, isFilesLoaded: false });
    }
  },
  exitSelectionMode: () => set({ isSelectionMode: false, selectedMessageUids: new Set() }),
  setInitialData: (
    messages,
    currentUserId,
    chatKey,
    chatType,
    createdBy,
    chatKeyUser,
    chatUid,
    chatId,
  ) => {
    set({
      messages,
      currentUserId,
      chatKey,
      isReady: true,
      chatType,
      chatUid,
      chatId,
      createdBy,
      chatKeyUser,
    });
  },
  prependMessages: (newMessages) =>
    set((state) => {
      const existingUids = new Set(state.messages.map((m) => m.uid));
      const unique = newMessages.filter((m) => !existingUids.has(m.uid));
      return unique.length ? { messages: [...unique, ...state.messages] } : state;
    }),
  setReplyTarget: (message) => set({ replyTarget: message }),
  clearReplyTarget: () => set({ replyTarget: null }),
  setForwardTargets: (messages) => set({ forwardTargets: messages }),
  clearForwardTargets: () => set({ forwardTargets: [] }),
  deleteMessage: (uid) =>
    set((state) => ({ messages: state.messages.filter((m) => m.uid !== uid) })),
  addMessage: (message) =>
    set((state) => {
      const idx = state.messages.findIndex(
        (m) => m.uid === message.uid || (message.requestUid && m.requestUid === message.requestUid),
      );
      if (idx !== -1) {
        const updated = [...state.messages];
        updated[idx] = message;
        return { messages: updated };
      }
      return { messages: [...state.messages, message] };
    }),
  updateMessageStatus: (uid, status) =>
    set((state) => ({
      messages: state.messages.map((m) => (m.uid === uid ? { ...m, status } : m)),
    })),
  markAsRead: (uid) =>
    set((state) => ({
      messages: state.messages.map((m) => (m.uid === uid ? { ...m, isNew: false } : m)),
    })),
  setFailedStatus: (requestUid) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.requestUid === requestUid ? { ...m, status: MESSAGE_STATUS.FAILED } : m,
      ),
    })),
  clearMessages: () => set({ messages: [], replyTarget: null }),
  clearMedia: () => set({ media: [], isLoadingMedia: false, isMediaLoaded: false }),
  clearFiles: () => set({ files: [], isLoadingFiles: false, isFilesLoaded: false }),
  reset: () =>
    set({
      messages: [],
      currentUserId: null,
      chatKey: null,
      isReady: false,
      replyTarget: null,
      media: [],
      files: [],
      isLoadingMedia: false,
      isMediaLoaded: false,
      isLoadingFiles: false,
      isFilesLoaded: false,
    }),
}));
