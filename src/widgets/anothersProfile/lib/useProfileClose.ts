"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback } from "react";
import { useShallow } from "zustand/shallow";

import { useAnothersProfileUIStore } from "../model/anothersProfileUIStore";

/**
 * Хук для безопасного закрытия профиля.
 * Использует явный редирект вместо router.back() для избежания проблем
 * с пустой историей браузера после рефреша страницы.
 */
export const useProfileClose = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { activeSection, setActiveSection } = useAnothersProfileUIStore(
    useShallow((s) => ({
      activeSection: s.activeSection,
      setActiveSection: s.setActiveSection,
    })),
  );

  const closeProfile = useCallback(() => {
    if (!pathname) {
      router.back();
      return;
    }

    if (activeSection === "main") {
      // Парсим pathname: /chats/{chatKey}/profile -> /chats/{chatKey}
      const pathParts = pathname.split("/").filter(Boolean);

      if (pathParts[0] === "chats" && pathParts.length === 3 && pathParts[2] === "profile") {
        const chatKey = pathParts[1];
        router.push(`/chats/${chatKey}`);
      } else if (
        pathParts[0] === "chats" &&
        pathParts.length === 5 &&
        pathParts[2] === "participant" &&
        pathParts[4] === "profile"
      ) {
        // /chats/{chatKey}/participant/{participantUid}/profile -> /chats/{chatKey}
        const chatKey = pathParts[1];
        router.push(`/chats/${chatKey}`);
      } else {
        // Fallback на router.back() если pathname не соответствует ожидаемому формату
        router.back();
      }
    } else {
      setActiveSection("main");
    }
  }, [pathname, router, activeSection, setActiveSection]);

  return closeProfile;
};
