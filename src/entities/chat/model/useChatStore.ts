import { create } from "zustand";

import { getChatFiles } from "@/entities/chat/api/getChatFiles";
import { ApiLinkItem, getChatLinks } from "@/entities/chat/api/getChatLinks";
import { MappedChatMessage, MappedMessageFile } from "@/features/chat/chat/model/types/mappedTypes";
import { MESSAGE_STATUS } from "@/shared/constants/constants";

import { getChatMedia } from "../api/getChatMedia";
import { ChatType } from "./types";

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

interface ExtendedMappedMessage extends MappedChatMessage {
  content: string;
  author?: {
    firstName?: string;
    lastName?: string;
  };
  sender?: {
    firstName?: string;
    lastName?: string;
  };
}

export interface MappedChatLink {
  url: string;
  title?: string;
  fromUser: {
    firstName: string;
    lastName: string;
  };
  messageId: number;
  createdAt: number;
}

interface ChatState {
  messages: MappedChatMessage[];
  currentUserId: string | null;
  chatKey: string | null;
  chatType: ChatType | null;
  createdBy: string | null;

  media: MappedMessageFile[];
  isLoadingMedia: boolean;
  isMediaLoaded: boolean;

  links: MappedChatLink[];
  isLoadingLinks: boolean;
  isLinksLoaded: boolean;

  files: MappedMessageFile[];
  isLoadingFiles: boolean;
  isFilesLoaded: boolean;

  chatUid: string | null;
  isReady: boolean;
  isHide: boolean;
  chatKeyUser: string | null;
  chatId: number | null;
  peerName: string | null;
  peerPhoto: string | null;

  replyTarget: MappedChatMessage | null;
  forwardTargets: MappedChatMessage[];

  fetchMedia: (chatKey: string) => Promise<void>;
  fetchLinks: (chatKey: string) => Promise<void>;
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
  clearLinks: () => void;
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

  links: [],
  isLoadingLinks: false,
  isLinksLoaded: false,

  files: [],
  isLoadingFiles: false,
  isFilesLoaded: false,

  isHide: false,
  peerName: null,
  peerPhoto: null,
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

      const allMedia = (data as ExtendedServerFile[]).map((f): MappedMessageFile => {
        return {
          ...f,
          fileType: f.fileType || f.file_type || "",
          fileUrl: f.fileUrl || f.file_url || "",
          uid: f.uid || f.file_uid || "",
          createdAt: f.createdAt || f.created_at || 0,
          ...({
            firstName: f.first_name || "",
            lastName: f.last_name || "",
            authorName: f.author_name || "",
            duration: f.duration || 0,
          } as Record<string, unknown>),
        } as MappedMessageFile;
      });

      set({ media: allMedia, isLoadingMedia: false, isMediaLoaded: true });
    } catch {
      set({ isLoadingMedia: false, isMediaLoaded: false });
    }
  },

  fetchLinks: async (chatKey: string) => {
    if (!chatKey) return;
    set({ isLoadingLinks: true, isLinksLoaded: false });
    try {
      const results = await getChatLinks(chatKey);
      const mappedLinks: MappedChatLink[] = results.map((item: ApiLinkItem) => ({
        url: item.url,
        title: item.title ?? undefined,
        fromUser: {
          firstName: item.from_user?.first_name || "",
          lastName: item.from_user?.last_name || "",
        },
        messageId: item.message_id,
        createdAt: item.created_at,
      }));
      set({ links: mappedLinks, isLoadingLinks: false, isLinksLoaded: true });
    } catch {
      set({ isLoadingLinks: false, isLinksLoaded: false });
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
      return { messages: [...uniqueNewMessages, ...state.messages] };
    });
  },

  setReplyTarget: (message) => set({ replyTarget: message }),
  clearReplyTarget: () => set({ replyTarget: null }),
  setForwardTargets: (messages) => set({ forwardTargets: messages }),
  clearForwardTargets: () => set({ forwardTargets: [] }),
  deleteMessage: (uid) =>
    set((state) => ({ messages: state.messages.filter((msg) => msg.uid !== uid) })),

  addMessage: (message: MappedChatMessage) => {
    set((state) => {
      const msg = message as ExtendedMappedMessage;

      // 1. Обновляем сообщения
      const updatedMessages = [...state.messages];
      const existingByUidIndex = state.messages.findIndex((m) => m.uid === msg.uid);

      if (existingByUidIndex !== -1) {
        updatedMessages[existingByUidIndex] = message;
      } else if (msg.requestUid) {
        const idx = state.messages.findIndex((m) => m.requestUid === msg.requestUid);
        if (idx !== -1) {
          updatedMessages[idx] = message;
        } else {
          updatedMessages.push(message);
        }
      } else {
        updatedMessages.push(message);
      }

      // 2. Обновляем ссылки
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const messageContent = msg.content || "";
      const foundUrls = messageContent.match(urlRegex);
      const currentLinks = [...state.links];

      if (foundUrls) {
        const newLinks: MappedChatLink[] = foundUrls
          .map((url: string) => ({
            url,
            title: undefined,
            fromUser: {
              firstName: msg.author?.firstName || msg.sender?.firstName || "",
              lastName: msg.author?.lastName || msg.sender?.lastName || "",
            },
            messageId: Number(msg.id) || 0,
            createdAt: Math.floor(Date.now() / 1000),
          }))
          .filter((newLink) => !state.links.some((existing) => existing.url === newLink.url));

        if (newLinks.length > 0) {
          currentLinks.unshift(...newLinks);
        }
      }

      // 3. Обновляем медиа
      const incomingUids = new Set(message.filesList?.map((f) => f.uid) || []);
      let updatedMedia = state.media.filter((m) => !incomingUids.has(m.uid));

      if (message.filesList && message.filesList.length > 0) {
        updatedMedia = [...message.filesList, ...updatedMedia];
      }

      return {
        messages: updatedMessages,
        links: currentLinks,
        media: updatedMedia,
      };
    });
  },

  updateMessageStatus: (uid, status) =>
    set((state) => ({
      messages: state.messages.map((msg) => (msg.uid === uid ? { ...msg, status } : msg)),
    })),

  markAsRead: (uid) =>
    set((state) => ({
      messages: state.messages.map((msg) => (msg.uid === uid ? { ...msg, isNew: false } : msg)),
    })),

  setFailedStatus: (requestUid) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.requestUid === requestUid ? { ...msg, status: MESSAGE_STATUS.FAILED } : msg,
      ),
    })),

  clearMessages: () => set({ messages: [], replyTarget: null, links: [], isLinksLoaded: false }),
  clearMedia: () => set({ media: [], isLoadingMedia: false, isMediaLoaded: false }),
  clearLinks: () => set({ links: [], isLoadingLinks: false, isLinksLoaded: false }),
  clearFiles: () => set({ files: [], isLoadingFiles: false, isFilesLoaded: false }),

  reset: () =>
    set({
      messages: [],
      currentUserId: null,
      chatKey: null,
      isReady: false,
      replyTarget: null,
      media: [],
      links: [],
      files: [],
      isLoadingMedia: false,
      isLoadingLinks: false,
      isMediaLoaded: false,
      isLoadingFiles: false,
      isFilesLoaded: false,
      isLinksLoaded: false,
      peerName: null,
      peerPhoto: null,
      // forwardTargets: [],
    }),
}));
