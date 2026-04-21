"use client";
import { usePathname } from "next/navigation";

import { cn } from "../shadcn/lib/utils";
import { MainContent } from "../ui/mainContent";
import { Sidebar } from "../ui/sidebar";

type ResponsiveLayoutProps = {
  children: React.ReactNode; // Центральная область (Main)
  sidebar: React.ReactNode; // Левая область
  extra: React.ReactNode; // Правая область (опционально)
};

export const ResponsiveLayout = ({ children, sidebar, extra }: ResponsiveLayoutProps) => {
  const pathname = usePathname() ?? "";
  const pathParts = pathname.split("/").filter(Boolean);

  // 1. Условие для области EXTRA (Профиль в чате)
  // Маршрут: /chats/{id}/profile или /chats/{chatKey}/participant/{uid}/profile
  const isExtraActive =
    (pathParts[0] === "chats" && pathParts.length === 3 && pathParts[2] === "profile") ||
    (pathParts[0] === "chats" &&
      pathParts.length === 5 &&
      pathParts[2] === "participant" &&
      pathParts[4] === "profile");

  // 2. Условие для области MAIN (Сам чат или страница приглашения)
  // Маршрут: /chats/{id}, /chats/{uid} или /chats/join/{chatKey}
  const isMainActive =
    pathParts[0] === "chats" &&
    (pathParts.length === 2 || (pathParts.length === 3 && pathParts[1] === "join"));

  // 3. Условие для области SIDEBAR (Списки, настройки, создание групп)
  // Все остальные маршруты: /chats, /settings, /settings/profile, /contacts и т.д.
  const isSidebarActive = !isExtraActive && !isMainActive;

  return (
    <>
      <Sidebar
        className={cn(
          "desktop:flex",
          // На мобилке: показываем только если не активен чат и не активен профиль
          isSidebarActive ? "flex" : "hidden",
        )}
      >
        {sidebar}
      </Sidebar>
      <MainContent
        className={cn(
          "desktop:flex",
          // На мобилке: показываем только если активен именно чат
          isMainActive ? "flex" : "hidden",
        )}
      >
        {children}
      </MainContent>
      {/* EXTRA: Правая колонка (Профиль/Инфо) */}
      {isExtraActive && <Sidebar className={cn("flex")}>{extra}</Sidebar>}
    </>
  );
};
