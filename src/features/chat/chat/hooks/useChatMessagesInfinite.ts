"use client";

import { useInfiniteQuery } from "@tanstack/react-query";

import { getMessagesClient } from "@/entities/chat/api/getMessagesClient";

import { ChatMessageList } from "../model/types/serverTypes";

const PAGE_SIZE = 50;

const extractPageFromUrl = (url: string | null | undefined): number | null => {
  if (!url) return null;

  try {
    let urlStr = url;
    if (url.startsWith("/")) {
      urlStr = process.env.NEXT_PUBLIC_API_URL + url;
    }

    const urlObj = new URL(urlStr);
    const page = urlObj.searchParams.get("page");

    if (page) {
      const parsedPage = parseInt(page, 10);
      return isNaN(parsedPage) ? null : parsedPage;
    }

    return null;
  } catch (error) {
    console.error("Failed to extract page from URL:", error);
    return null;
  }
};

export const useChatMessagesInfinite = (chatUid: string | null) => {
  return useInfiniteQuery({
    queryKey: ["chat-messages", chatUid],
    enabled: Boolean(chatUid),
    initialPageParam: 1,
    gcTime: 0,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,

    retry: false,
    getNextPageParam: (lastPage: { data: ChatMessageList; success: boolean }) => {
      const nextUrl = lastPage?.data?.next;
      const nextPage = extractPageFromUrl(nextUrl);

      return nextPage;
    },

    getPreviousPageParam: (firstPage) => {
      const prevUrl = firstPage?.data?.previous;
      return extractPageFromUrl(prevUrl);
    },
    queryFn: async ({ pageParam = 1 }) => {
      const result = await getMessagesClient({
        uid: chatUid!,
        page: pageParam,
        page_size: PAGE_SIZE,
        // ordering: "-created_at",
      });

      console.log("result", result);
      if (!result.success) {
        throw new Error("Ошибка получения сообщений");
      }

      return result;
    },
  });
};
