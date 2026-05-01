import { create } from "zustand";

import { ApiLinkItem, getChatLinks } from "@/entities/chat/api/getChatLinks";
import { MappedChatMessage, MappedMessageFile } from "@/features/chat/chat/model/types/mappedTypes";
import { MESSAGE_STATUS } from "@/shared/constants/constants";

import { getChatMedia } from "../api/getChatMedia";
import { ChatType } from "./types";

// Интерфейс расширен строго в соответствии с базовым типом
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

  chatUid: string | null;
  isReady: boolean;
  isHide: boolean;
  chatKeyUser: string | null;
  chatId: number | null;

  replyTarget: MappedChatMessage | null;
  forwardTargets: MappedChatMessage[];

  fetchMedia: (chatKey: string) => Promise<void>;
  fetchLinks: (chatKey: string) => Promise<void>;

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
      const imagesOnly = (data as unknown as Record<string, unknown>[])
        .filter((file) => {
          const type = (file.file_type || file.fileType) as string | undefined;
          return type?.startsWith("image/") || type?.startsWith("audio/");
        })
        .map((file) => ({
          ...file,
          fileType: (file.file_type || file.fileType) as string,
          fileUrl: (file.file_url || file.fileUrl) as string,
        })) as unknown as MappedMessageFile[];

      set({ media: imagesOnly, isLoadingMedia: false, isMediaLoaded: true });
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

  addMessage: (message) => {
    set((state) => {
      const msg = message as ExtendedMappedMessage;
      const existingByUidIndex = state.messages.findIndex((m) => m.uid === msg.uid);
      const updatedMessages = [...state.messages];

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

      // Извлечение ссылок с УСИЛЕННОЙ проверкой на дубликаты
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const messageContent = msg.content || "";
      const foundUrls = messageContent.match(urlRegex);
      let updatedLinks = [...state.links];

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
          .filter((newLink) => {
            // Если ссылка с таким URL уже есть в этом чате (с тем же messageId или просто в списке), не добавляем
            // Это решает проблему дублей при мгновенном отображении + сокет/бэк
            const isAlreadyExists = state.links.some(
              (existing) =>
                existing.url === newLink.url &&
                (existing.messageId === newLink.messageId || newLink.messageId === 0),
            );
            return !isAlreadyExists;
          });

        if (newLinks.length > 0) {
          updatedLinks = [...newLinks, ...updatedLinks];
        }
      }

      return {
        messages: updatedMessages,
        links: updatedLinks,
      };
    });
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

  reset: () =>
    set({
      messages: [],
      currentUserId: null,
      chatKey: null,
      isReady: false,
      replyTarget: null,
      media: [],
      links: [],
      isLoadingMedia: false,
      isLoadingLinks: false,
      isMediaLoaded: false,
      isLinksLoaded: false,
    }),
}));
