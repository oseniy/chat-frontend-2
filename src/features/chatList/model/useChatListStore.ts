import { create } from "zustand";

import { getGroupChannel } from "@/entities/chat/api/getGroupChannel";
import { mapChatListItem } from "@/entities/chat/model/mappers";
import { ChatListItem } from "@/entities/chat/model/types";

import { applyChatOrder } from "../lib/applyChatOrder";

type ChatsByKey = Record<string, ChatListItem>;

type ChatListState = {
  chatsByKey: ChatsByKey;
  order: string[];
  count: number;
  lastMergedAt: number;

  // base
  mergeChats: (chats: ChatListItem[]) => void;
  upsertChat: (chat: ChatListItem) => void;
  patchChat: (chatKey: string, patch: Partial<ChatListItem>) => void;
  removeChat: (chatKey: string) => void;
  decrementUnread: (chatKey: string, count?: number) => void;

  // sync
  setCount: (count: number) => void;

  // async
  addNewChat: (chatKey: string) => Promise<void>;

  // selectors
  getChatIdByUid: (uid: string) => number | null;

  reset: () => void;
};

export const useChatListStore = create<ChatListState>((set, get) => ({
  chatsByKey: {},
  order: [],
  count: 0,
  lastMergedAt: 0,

  setCount: (count) => set({ count }),
  mergeChats: (chats) =>
    set((state) => {
      const chatsByKey = { ...state.chatsByKey };
      let order = [...state.order];

      for (const chat of chats) {
        const exists = chatsByKey[chat.key];
        chatsByKey[chat.key] = exists ? { ...exists, ...chat } : chat;

        if (!exists) order.push(chat.key);
      }

      order = applyChatOrder(order, chatsByKey);
      return { chatsByKey, order };
    }),

  decrementUnread: (chatKey, count = 1) =>
    set((state) => {
      const chat = state.chatsByKey[chatKey];
      if (!chat) return state;

      const nextUnread = Math.max(0, chat.unreadMessages - count);

      return {
        chatsByKey: {
          ...state.chatsByKey,
          [chatKey]: {
            ...chat,
            unreadMessages: nextUnread,
          },
        },
      };
    }),

  upsertChat: (chat) =>
    set((state) => {
      const chatsByKey = {
        ...state.chatsByKey,
        [chat.key]: {
          ...state.chatsByKey[chat.key],
          ...chat,
        },
      };

      const order = applyChatOrder(
        state.order.includes(chat.key) ? state.order : [...state.order, chat.key],
        chatsByKey,
        chat.key,
      );

      return { chatsByKey, order };
    }),

  patchChat: (chatKey, patch) =>
    set((state) => {
      const chat = state.chatsByKey[chatKey];
      if (!chat) return state;

      const chatsByKey = {
        ...state.chatsByKey,
        [chatKey]: { ...chat, ...patch },
      };

      return {
        chatsByKey,
        order: applyChatOrder(state.order, chatsByKey, chatKey),
      };
    }),

  removeChat: (chatKey) =>
    set((state) => ({
      chatsByKey: Object.fromEntries(
        Object.entries(state.chatsByKey).filter(([k]) => k !== chatKey),
      ),
      order: state.order.filter((k) => k !== chatKey),
    })),

  addNewChat: async (chatKey) => {
    const res = await getGroupChannel(chatKey);
    if (!res.success) return;
    const chat = mapChatListItem(res.data);
    set((state) => ({
      chatsByKey: { ...state.chatsByKey, [chat.key]: chat },
      order: applyChatOrder([...state.order, chat.key], {
        ...state.chatsByKey,
        [chat.key]: chat,
      }),
    }));
  },

  getChatIdByUid: (uid) => {
    const chat = Object.values(get().chatsByKey).find((c) => c.member.uid === uid);
    return chat?.id ?? null;
  },

  reset: () => set({ chatsByKey: {}, order: [], count: 0, lastMergedAt: 0 }),
}));
