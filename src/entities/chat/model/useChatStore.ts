import { create } from "zustand";

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
  chatUid: string | null;
  isReady: boolean;
  isHide: boolean;
  chatKeyUser: string | null;
  chatId: number | null;

  replyTarget: MappedChatMessage | null;
  forwardTargets: MappedChatMessage[];

  fetchMedia: (chatKey: string) => Promise<void>;

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
    forwardTargets?: [],
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
    set(() => ({
      isSelectionMode: true,
      selectedMessageUids: uid ? new Set([uid]) : new Set(),
    })),

  enterVoiceRecord: () => set({ isVoiceRecord: true }),
  exitVoiceRecord: () => set({ isVoiceRecord: false }),

  toggleMessageSelection: (uid) =>
    set((state) => {
      const next = new Set(state.selectedMessageUids);
      next.has(uid) ? next.delete(uid) : next.add(uid);

      return {
        selectedMessageUids: next,
        isSelectionMode: next.size > 0,
      };
    }),

  fetchMedia: async (chatKey: string) => {
    if (!chatKey) return;
    set({ isLoadingMedia: true });
    try {
      const data = await getChatMedia(chatKey);

      const allFiles = data.map((file): MappedMessageFile => {
        const f = file as MappedMessageFile & {
          file_type?: string;
          file_url?: string;
          file_uid?: string;
        };

        return {
          ...file,
          fileType: f.fileType || f.file_type || "",
          fileUrl: f.fileUrl || f.file_url || "",
          uid: f.uid || f.file_uid || "",
        };
      });

      console.log("DEBUG: Загруженные файлы:", allFiles);

      set({
        media: allFiles,
        isLoadingMedia: false,
        isMediaLoaded: true,
      });
    } catch {
      // Убрали (error), чтобы ESLint не ругался
      set({ isLoadingMedia: false, isMediaLoaded: false });
    }
  },

  exitSelectionMode: () =>
    set(() => ({
      isSelectionMode: false,
      selectedMessageUids: new Set(),
    })),

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

  prependMessages: (newMessages) => {
    set((state) => {
      if (newMessages.length === 0) return state;
      const existingUids = new Set(state.messages.map((msg) => msg.uid));
      const uniqueNewMessages = newMessages.filter((msg) => !existingUids.has(msg.uid));
      if (uniqueNewMessages.length === 0) return state;
      return {
        messages: [...uniqueNewMessages, ...state.messages],
      };
    });
  },

  setReplyTarget: (message) => set({ replyTarget: message }),
  clearReplyTarget: () => set({ replyTarget: null }),
  setForwardTargets: (messages) => set({ forwardTargets: messages }),
  clearForwardTargets: () => set({ forwardTargets: [] }),

  deleteMessage: (uid) =>
    set((state) => ({ messages: state.messages.filter((msg) => msg.uid !== uid) })),

  addMessage: (message) => {
    set((state) => {
      const existingByUidIndex = state.messages.findIndex((msg) => msg.uid === message.uid);
      if (existingByUidIndex !== -1) {
        const updated = [...state.messages];
        updated[existingByUidIndex] = message;
        return { messages: updated };
      }

      if (message.requestUid) {
        const existingByRequestUidIndex = state.messages.findIndex(
          (msg) => msg.requestUid === message.requestUid,
        );
        if (existingByRequestUidIndex !== -1) {
          const updated = [...state.messages];
          updated[existingByRequestUidIndex] = message;
          return { messages: updated };
        }
      }

      return { messages: [...state.messages, message] };
    });
  },

  updateMessageStatus: (uid, status) => {
    set((state) => ({
      messages: state.messages.map((msg) => (msg.uid === uid ? { ...msg, status } : msg)),
    }));
  },

  markAsRead: (uid) => {
    set((state) => ({
      messages: state.messages.map((msg) => (msg.uid === uid ? { ...msg, isNew: false } : msg)),
    }));
  },

  setFailedStatus: (requestUid) => {
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.requestUid === requestUid ? { ...msg, status: MESSAGE_STATUS.FAILED } : msg,
      ),
    }));
  },

  clearMessages: () => set({ messages: [], replyTarget: null }),

  clearMedia: () => set({ media: [], isLoadingMedia: false, isMediaLoaded: false }),
  reset: () =>
    set({
      messages: [],
      currentUserId: null,
      chatKey: null,
      isReady: false,
      replyTarget: null,
      media: [],
      isLoadingMedia: false,
      isMediaLoaded: false,
      // forwardTargets: [],
    }),
}));
