import { create } from "zustand";

import { searchMessagePosition } from "../../lib/searchMessagePosition";

export const navigateToMessage = async ({
  userUid,
  type,
  messageUid,
}: {
  userUid: string;
  type: "id_or_uid" | "content";
  messageUid: string;
}) => {
  const result = await searchMessagePosition({
    userUid,
    type: type,
    query: messageUid,
  });

  if (!result.success) {
    return;
  }

  useMessageNavigation
    .getState()
    .navigate(result.data[0].uid, result.data[0].page, type === "content" ? messageUid : undefined);
};

interface ChatNavigationState {
  targetMessageId: string | null;
  targetPage: number | null;
  highlightMessageId: string | null;
  requestId: number;

  searchQuery: string | null;

  navigate: (messageId: string, page: number, query?: string) => void;
  clearHighlight: () => void;
  reset: () => void;
  resetSearch: () => void;
}

export const useMessageNavigation = create<ChatNavigationState>((set) => ({
  targetMessageId: null,
  targetPage: null,
  highlightMessageId: null,
  requestId: 0,

  searchQuery: null,

  navigate: (messageId, page, query) =>
    set((state) => ({
      targetMessageId: messageId,
      targetPage: page,
      searchQuery: query ?? null,
      highlightMessageId: messageId,
      requestId: state.requestId + 1,
    })),

  clearHighlight: () =>
    set({
      highlightMessageId: null,
    }),

  reset: () =>
    set({
      targetMessageId: null,
      targetPage: null,
      highlightMessageId: null,
    }),

  resetSearch: () => set({ targetMessageId: null, targetPage: null, searchQuery: null }),
}));
