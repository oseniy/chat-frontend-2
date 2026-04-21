"use client";

import { UseInfiniteQueryResult } from "@tanstack/react-query";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import { useChatStore } from "@/entities/chat/model/useChatStore";
import { cn } from "@/shared/shadcn/lib/utils";

import { useAutoRead } from "../hooks";
import { useMessageScroll } from "../hooks/useMessageScroll";
import { groupMessagesByDate } from "../lib/getMessageByDate";
import { useMessageNavigation } from "../model/store/useChatNavigationStore";
import { MessageGroup } from "./messageGroup";
import { MessageListEmptyInfo } from "./messageListEpmtyInfo";
import { ScrollDownBtn } from "./scrollDownBtn";
import TopLoader from "./topLoader";

interface MessageListProps {
  className?: string;
  currentUserId: string;
  fetchNextPage?: UseInfiniteQueryResult["fetchNextPage"];
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  loadedPages?: number;
  isOwner: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({
  className,
  currentUserId,
  isOwner,
  fetchNextPage,
  hasNextPage = false,
  isFetchingNextPage = false,
  loadedPages = 1,
}) => {
  const messages = useChatStore((s) => s.messages);
  const isReady = useChatStore((s) => s.isReady);
  const chatType = useChatStore((s) => s.chatType);
  const chatId = useChatStore((s) => s.chatId);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const topLoaderRef = useRef<HTMLDivElement>(null);

  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // ✅ ВАЖНО: контроль prepend
  const isPrependingRef = useRef(false);
  const prevScrollHeightRef = useRef(0);

  const groups = useMemo(() => groupMessagesByDate(messages), [messages]);

  const { isAtBottom, handleScroll, scrollToBottom, performInitialScroll, scrollToMessage } =
    useMessageScroll({
      messages,
      groups,
      currentUserId,
      scrollToUnread: true,
      scrollBehavior: "auto",
      topOffset: 16,
      scrollContainerRef,
    });

  useAutoRead({
    messages,
    autoReadEnabled: true,
    readThreshold: 0.1,
    readRootMargin: "50px",
    batchDelay: 150,
    scrollContainerRef,
  });

  // ✅ initial scroll
  useEffect(() => {
    if (!isReady) return;

    performInitialScroll();

    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 50);

    return () => clearTimeout(timer);
  }, [isReady, performInitialScroll]);

  // =========================
  // 🔽 NAVIGATION (jump to msg)
  // =========================

  const targetMessageId = useMessageNavigation((s) => s.targetMessageId);
  const targetPage = useMessageNavigation((s) => s.targetPage);
  const requestId = useMessageNavigation((s) => s.requestId);
  const clearHighlight = useMessageNavigation((s) => s.clearHighlight);
  const reset = useMessageNavigation((s) => s.reset);
  const searchQuery = useMessageNavigation((s) => s.searchQuery);

  const saveScrollSnapshot = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    prevScrollHeightRef.current = container.scrollHeight;
  };

  // 🔽 подгрузка до нужной страницы
  useEffect(() => {
    if (targetPage === null) return;

    if (loadedPages < targetPage && hasNextPage && !isFetchingNextPage) {
      isPrependingRef.current = true;
      saveScrollSnapshot();
      fetchNextPage?.();
    }
  }, [targetPage, loadedPages, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // 🔽 скролл к сообщению
  useEffect(() => {
    if (!targetMessageId) return;

    const exists = messages.some((m) => m.uid === targetMessageId);
    if (!exists) return;

    scrollToMessage(targetMessageId);

    if (searchQuery) return;

    const timer = setTimeout(() => {
      clearHighlight();
      reset();
    }, 1500);

    return () => clearTimeout(timer);
  }, [messages, requestId, targetMessageId]);

  // =========================
  // 🔥 СТАБИЛИЗАЦИЯ SCROLL
  // =========================

  useLayoutEffect(() => {
    if (!isPrependingRef.current) return;

    const container = scrollContainerRef.current;
    if (!container) return;

    const newScrollHeight = container.scrollHeight;
    const heightDiff = newScrollHeight - prevScrollHeightRef.current;

    if (heightDiff > 0) {
      container.scrollTop += heightDiff;
    }

    isPrependingRef.current = false;
  }, [messages]);

  // =========================
  // 🔼 INFINITE SCROLL (TOP)
  // =========================

  useEffect(() => {
    const root = scrollContainerRef.current;
    const target = topLoaderRef.current;

    if (!root || !target || !fetchNextPage || !hasNextPage) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isFetchingNextPage) {
          isPrependingRef.current = true;
          saveScrollSnapshot();
          fetchNextPage();
        }
      },
      {
        root,
        threshold: 0.1,
      },
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // =========================

  const showEmptyState = groups.length === 0 && !isInitialLoading;
  const showLoadingState = isInitialLoading || !isReady;

  return (
    <div className="relative flex h-full min-h-0 flex-col">
      {showLoadingState && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#fafbfd]">
          <div className="flex flex-col items-center gap-3">
            <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
            <p className="text-gray subtext">Загрузка сообщений...</p>
          </div>
        </div>
      )}

      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className={cn(
          "bg-accent desktop:bg-[#fafbfd] relative flex h-full flex-col gap-3 overflow-y-auto py-4",
          showLoadingState ? "pointer-events-none opacity-0" : "opacity-100",
          className,
        )}
      >
        {/* 🔥 SENTINEL (не влияет на layout) */}
        <div ref={topLoaderRef} className="h-1" />

        {/* 🔥 LOADER (вне потока) */}
        {isFetchingNextPage && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2">
            <TopLoader />
          </div>
        )}

        {showEmptyState && <MessageListEmptyInfo type={chatType} isOwner={isOwner} />}

        <div className="mt-auto flex flex-col gap-3">
          {groups.map((group) => (
            <MessageGroup
              key={group.id}
              label={group.label}
              messages={group.messages}
              currentUserId={currentUserId}
              chatId={chatId || 0}
              passDataAttributes
              isGroup={chatType === "public-group" || chatType === "private-group"}
            />
          ))}
        </div>
      </div>

      {!isAtBottom && !showLoadingState && (
        <ScrollDownBtn className="absolute right-3 bottom-2" onClick={scrollToBottom} />
      )}
    </div>
  );
};
