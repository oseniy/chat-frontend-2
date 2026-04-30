import { create } from "zustand";

import { getChatFiles } from "@/entities/chat/api/getChatFiles";
import { MappedChatMessage, MappedMessageFile } from "@/features/chat/chat/model/types/mappedTypes";
import { MESSAGE_STATUS } from "@/shared/constants/constants";

import { getChatMedia } from "../api/getChatMedia";
import { ChatType } from "./types";

// Интерфейс для маппинга полей сервера, вынесен за пределы стора
interface ExtendedServerFile extends MappedMessageFile {
  file_type?: string;
  file_url?: string;
  file_uid?: string;
  created_at?: number;
  first_name?: string;
  last_name?: string;
  author_name?: string;
  duration?: number;
}

interface ChatState {
  messages: MappedChatMessage[];
  currentUserId: string | null;
  chatKey: string | null;
  chatType: ChatType | null;
  createdBy: string | null;

  // Медиа
  media: MappedMessageFile[];
  isLoadingMedia: boolean;
  isMediaLoaded: boolean;

  // Файлы
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
    set(() => ({
      isSelectionMode: true,
      selectedMessageUids: uid ? new Set([uid]) : new Set(),
    })),

  enterVoiceRecord: () => set({ isVoiceRecord: true }),
  exitVoiceRecord: () => set({ isVoiceRecord: false }),

  // ИСПРАВЛЕНО: Заменен тернарный оператор на if/else для прохождения проверки ESLint
  toggleMessageSelection: (uid) =>
    set((state) => {
      const next = new Set(state.selectedMessageUids);

      if (next.has(uid)) {
        next.delete(uid);
      } else {
        next.add(uid);
      }

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

      // Маппим данные, разрешая и картинки, и аудио
      const allMedia = (data as ExtendedServerFile[]).map((f): MappedMessageFile => {
        return {
          ...f,
          fileType: f.fileType || f.file_type || "",
          fileUrl: f.fileUrl || f.file_url || "",
          uid: f.uid || f.file_uid || "",
          createdAt: f.createdAt || f.created_at || 0,
          // Безопасный проброс доп. полей для типизации
          ...({
            firstName: f.first_name || f.first_name || "",
            lastName: f.last_name || f.last_name || "",
            authorName: f.author_name || f.author_name || "",
            duration: f.duration || 0,
          } as Record<string, unknown>),
        } as MappedMessageFile;
      });

      set({ media: allMedia, isLoadingMedia: false, isMediaLoaded: true });
    } catch {
      set({ isLoadingMedia: false, isMediaLoaded: false });
    }
  },

  fetchFiles: async (chatKey: string) => {
    if (!chatKey) return;

    set({
      isLoadingFiles: true,
      files: [],
      isFilesLoaded: false,
    });

    try {
      const data = await getChatFiles(chatKey);
      set({
        files: data,
        isLoadingFiles: false,
        isFilesLoaded: true,
      });
    } catch (error) {
      set({ isLoadingFiles: false, isFilesLoaded: false });
      console.error("Ошибка загрузки файлов:", error);
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
