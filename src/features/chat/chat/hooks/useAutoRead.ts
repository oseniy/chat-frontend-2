import { useCallback, useEffect, useRef } from "react";

import { sendReadStatus } from "@/entities/chat/api/sendReadStatus";
import { setChatList } from "@/features/chatList/api/setChatList";
import { useChatListStore } from "@/features/chatList/model/useChatListStore";

import { AUTO_READ_CONFIG } from "../lib/constants";
import { MappedChatMessage } from "../model/types/mappedTypes";

type BatchItem = {
  chatKey: string;
  messageUid: string;
};

interface UseAutoReadProps {
  messages: MappedChatMessage[];
  autoReadEnabled: boolean;
  readThreshold: number;
  readRootMargin: string;
  batchDelay: number;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
}

interface UseAutoReadReturn {
  observerRef: React.MutableRefObject<IntersectionObserver | null>;
  processedUIDsRef: React.MutableRefObject<Set<string>>;
}

export const useAutoRead = ({
  messages,
  autoReadEnabled,
  readThreshold = AUTO_READ_CONFIG.READ_THRESHOLD,
  readRootMargin = AUTO_READ_CONFIG.READ_ROOT_MARGIN,
  batchDelay = AUTO_READ_CONFIG.BATCH_DELAY,
  scrollContainerRef,
}: UseAutoReadProps): UseAutoReadReturn => {
  const observerRef = useRef<IntersectionObserver | null>(null);

  const processedUIDsRef = useRef<Set<string>>(new Set());
  const observedElementsRef = useRef<Map<string, Element>>(new Map());

  const batchQueueRef = useRef<BatchItem[]>([]);
  const batchTimerRef = useRef<NodeJS.Timeout | null>(null);

  const lastSeenMessageIdRef = useRef<number | null>(null);
  const lastSeenTimerRef = useRef<NodeJS.Timeout | null>(null);

  const chatIdRef = useRef<number | null>(null);

  const decrementUnread = useChatListStore((s) => s.decrementUnread);

  /**
   * flush read status batch
   */
  const flushBatch = useCallback(async () => {
    if (batchQueueRef.current.length === 0) return;

    const batch = [...batchQueueRef.current];
    batchQueueRef.current = [];

    const results = await Promise.allSettled(
      batch.map(async ({ chatKey, messageUid }) => {
        await sendReadStatus({
          chatKey,
          idOrUid: messageUid,
        });

        processedUIDsRef.current.add(messageUid);
      }),
    );

    const errors = results.filter((r): r is PromiseRejectedResult => r.status === "rejected");

    if (errors.length) {
      console.error(`Read errors ${errors.length}/${batch.length}`, errors);
    }
  }, []);

  /**
   * update last seen cursor
   */
  const flushLastSeen = useCallback(async () => {
    if (!lastSeenMessageIdRef.current || !chatIdRef.current) return;

    try {
      await setChatList({
        index: chatIdRef.current,
        last_seen_message: lastSeenMessageIdRef.current,
      });
    } catch (error) {
      console.error("Failed updating last_seen_message", error);
    }
  }, []);

  /**
   * intersection handler
   */
  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (!autoReadEnabled) return;

      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const element = entry.target as HTMLElement;

        const messageUid = element.dataset.messageUid;
        const messageId = element.dataset.messageId;
        const chatKey = element.dataset.chatKey;
        const chatId = element.dataset.chatId;

        const isFromCurrentUser = element.dataset.isFromCurrentUser === "true";

        const isNew = element.dataset.isNew === "true";

        if (!messageUid || !messageId || !chatKey || !chatId) return;
        if (isFromCurrentUser || !isNew) return;
        if (processedUIDsRef.current.has(messageUid)) return;

        chatIdRef.current = Number(chatId);

        /**
         * add read status to batch
         */
        batchQueueRef.current.push({
          chatKey,
          messageUid,
        });

        decrementUnread(chatKey);

        if (batchTimerRef.current) {
          clearTimeout(batchTimerRef.current);
        }

        batchTimerRef.current = setTimeout(flushBatch, batchDelay);

        /**
         * update last seen cursor
         */
        lastSeenMessageIdRef.current = Number(messageId);

        if (lastSeenTimerRef.current) {
          clearTimeout(lastSeenTimerRef.current);
        }

        lastSeenTimerRef.current = setTimeout(flushLastSeen, batchDelay);
      });
    },
    [autoReadEnabled, batchDelay, flushBatch, flushLastSeen, decrementUnread],
  );

  /**
   * init observer
   */
  useEffect(() => {
    if (!scrollContainerRef.current) return;

    observerRef.current = new IntersectionObserver(handleIntersection, {
      root: scrollContainerRef.current,
      threshold: readThreshold,
      rootMargin: readRootMargin,
    });

    return () => {
      observerRef.current?.disconnect();

      if (batchTimerRef.current) clearTimeout(batchTimerRef.current);
      if (lastSeenTimerRef.current) clearTimeout(lastSeenTimerRef.current);
    };
  }, [handleIntersection, readThreshold, readRootMargin, scrollContainerRef]);

  /**
   * observe message elements
   */
  useEffect(() => {
    const observer = observerRef.current;
    const root = scrollContainerRef.current;

    if (!observer || !root) return;

    const elements = root.querySelectorAll("[data-message-uid]");

    elements.forEach((el) => {
      const uid = (el as HTMLElement).dataset.messageUid;

      if (!uid) return;
      if (observedElementsRef.current.has(uid)) return;

      observer.observe(el);
      observedElementsRef.current.set(uid, el);
    });

    /**
     * cleanup removed nodes
     */
    observedElementsRef.current.forEach((element, uid) => {
      if (!document.body.contains(element)) {
        observer.unobserve(element);
        observedElementsRef.current.delete(uid);
      }
    });
  }, [messages, scrollContainerRef]);

  return {
    observerRef,
    processedUIDsRef,
  };
};
