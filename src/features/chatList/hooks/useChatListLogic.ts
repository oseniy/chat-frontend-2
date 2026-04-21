import { useEffect, useMemo, useRef } from "react";
import { useShallow } from "zustand/shallow";

import { filterChats } from "../lib/filterChats";
import { useChatsInfinite } from "../lib/useChatsInfinite";
import { useChatListStore } from "../model/useChatListStore";

export const useChatList = (search: string) => {
  const { fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } = useChatsInfinite();

  const { chatsById, order } = useChatListStore(
    useShallow((s) => ({
      chatsById: s.chatsByKey,
      order: s.order,
    })),
  );
  const chats = useMemo(() => order.map((id) => chatsById[id]).filter(Boolean), [order, chatsById]);

  const filtered = useMemo(() => filterChats(chats, search), [chats, search]);

  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!loadMoreRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return {
    chats: filtered,
    isLoading,
    isError,
    isFetchingNextPage,
    loadMoreRef,
  };
};
