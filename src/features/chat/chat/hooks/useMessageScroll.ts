import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import { MappedChatMessage } from "../model/types/mappedTypes";
import { MessageGroupType } from "../model/types/types";

interface UseMessageScrollProps {
  messages: MappedChatMessage[];
  groups: MessageGroupType[];
  currentUserId: string;
  scrollToUnread: boolean;
  scrollBehavior: ScrollBehavior;
  topOffset: number;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
}

interface UseMessageScrollReturn {
  isAtBottom: boolean;
  handleScroll: () => void;
  scrollToBottom: () => void;
  isReady: boolean;
  performInitialScroll: () => void;
  scrollToMessage: (uid: string) => void;
}

export const useMessageScroll = ({
  messages,
  groups,
  currentUserId,
  scrollToUnread,
  scrollBehavior,
  topOffset,
  scrollContainerRef,
}: UseMessageScrollProps): UseMessageScrollReturn => {
  // Refs
  const hasScrolledRef = useRef(false);
  const lastMessageCountRef = useRef(messages.length);
  const initialScrollDoneRef = useRef(false);
  const isAtBottomRef = useRef(true);
  const prevChatIdRef = useRef<MappedChatMessage["chatId"] | null>(null);

  // Состояния
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [isReady, setIsReady] = useState(false);

  // Определяем ID чата из сообщений
  const currentChatId = messages[0]?.chatId || null;

  // Сброс состояний при переходе между чатами
  useEffect(() => {
    if (currentChatId && prevChatIdRef.current !== currentChatId) {
      hasScrolledRef.current = false;
      initialScrollDoneRef.current = false;
      lastMessageCountRef.current = messages.length;
      isAtBottomRef.current = true;
      prevChatIdRef.current = currentChatId;

      const timer = setTimeout(() => {
        setIsAtBottom(true);
        setIsReady(false);
      }, 0);

      return () => clearTimeout(timer);
    }
  }, [currentChatId, messages.length]);

  // Синхронизация ref с state для кнопки
  useLayoutEffect(() => {
    if (isAtBottomRef.current !== isAtBottom) {
      setIsAtBottom(isAtBottomRef.current);
    }
  }, [isAtBottom]);

  // Поиск первого непрочитанного сообщения
  const findFirstUnreadMessage = useCallback((): string | null => {
    if (!currentUserId) return null;

    for (const group of groups) {
      for (const msg of group.messages) {
        if (msg.isNew && msg.fromUser.uid !== currentUserId) {
          return msg.uid;
        }
      }
    }
    return null;
  }, [groups, currentUserId]);

  // Скролл к первому непрочитанному
  const scrollToFirstUnread = useCallback(() => {
    if (!scrollContainerRef.current || hasScrolledRef.current) return;

    const container = scrollContainerRef.current;
    const firstUnreadUid = findFirstUnreadMessage();

    if (!firstUnreadUid) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: scrollBehavior,
      });
      hasScrolledRef.current = true;
      setIsReady(true);
      return;
    }

    const tryScroll = (attempts = 5) => {
      const element = container.querySelector(
        `[data-message-uid="${firstUnreadUid}"]`,
      ) as HTMLElement | null;

      if (element) {
        const elementTop = element.getBoundingClientRect().top;
        const containerTop = container.getBoundingClientRect().top;
        const relativeTop = elementTop - containerTop;
        const targetScrollTop = container.scrollTop + relativeTop - topOffset;

        container.scrollTo({
          top: Math.max(0, targetScrollTop),
          behavior: scrollBehavior,
        });

        hasScrolledRef.current = true;
        setIsReady(true);
        return true;
      }

      if (attempts > 0) {
        setTimeout(() => tryScroll(attempts - 1), 30);
        return false;
      }

      setIsReady(true);
      return false;
    };

    tryScroll();
  }, [findFirstUnreadMessage, topOffset, scrollBehavior, scrollContainerRef]);

  const scrollToMessage = useCallback(
    (messageUid: string) => {
      if (!scrollContainerRef.current) return;

      const container = scrollContainerRef.current;
      const el = container.querySelector(
        `[data-message-uid="${messageUid}"]`,
      ) as HTMLElement | null;

      if (!el) return;

      const elTop = el.getBoundingClientRect().top;
      const containerTop = container.getBoundingClientRect().top;

      const target = container.scrollTop + (elTop - containerTop) - topOffset;

      container.scrollTo({
        top: Math.max(0, target),
        behavior: "smooth",
      });
    },
    [scrollContainerRef, topOffset],
  );

  // Скролл вниз
  const scrollToBottom = useCallback(() => {
    if (!scrollContainerRef.current) return;
    scrollContainerRef.current.scrollTo({
      top: scrollContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [scrollContainerRef]);

  // Обработка скролла - обновляем только ref, state обновляем если значение изменилось
  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const wasAtBottom = isAtBottomRef.current;
    const nowAtBottom = scrollHeight - (scrollTop + clientHeight) < 50;

    isAtBottomRef.current = nowAtBottom;

    // Обновляем state только если значение изменилось
    if (wasAtBottom !== nowAtBottom) {
      setIsAtBottom(nowAtBottom);
    }
  }, [scrollContainerRef]);

  // Начальный скролл
  const performInitialScroll = useCallback(() => {
    if (
      !scrollToUnread ||
      initialScrollDoneRef.current ||
      messages.length === 0 ||
      !currentUserId ||
      !scrollContainerRef.current
    ) {
      return;
    }

    initialScrollDoneRef.current = true;

    const checkAndScroll = () => {
      if (scrollContainerRef.current?.querySelector("[data-message-uid]")) {
        scrollToFirstUnread();
      } else {
        setTimeout(checkAndScroll, 20);
      }
    };

    checkAndScroll();
  }, [scrollToUnread, messages, currentUserId, scrollContainerRef, scrollToFirstUnread]);

  // Автоскролл при новых сообщениях
  useEffect(() => {
    if (!scrollContainerRef.current) return;

    // Проверяем, пришли ли новые сообщения (не первая загрузка)
    if (messages.length <= lastMessageCountRef.current) return;
    lastMessageCountRef.current = messages.length;

    if (!isAtBottomRef.current) return;

    // Если пользователь внизу и пришли новые - скроллим вниз
    if (hasScrolledRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, scrollContainerRef]);

  return {
    isAtBottom,
    handleScroll,
    scrollToBottom,
    isReady,
    performInitialScroll,
    scrollToMessage,
  };
};
