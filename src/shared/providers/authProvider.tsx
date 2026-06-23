"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { onAuthChannelMessage } from "../api/authChannel";
import { logout } from "../api/logout";
import { useAuthStore } from "../api/store";

const PUBLIC_ROUTES = ["/auth", "/auth/phone", "/auth/support", "/auth/support/success"];

interface AuthProviderProps {
  children: React.ReactNode;
  initialToken: string | null;
}

export const AuthProvider = ({ children, initialToken }: AuthProviderProps) => {
  const pathname = usePathname();

  const { setAccessToken, clearAccessToken, finishInitialization, isInitialized } = useAuthStore();
  const initialized = useRef(false);

  useEffect(() => {
    return onAuthChannelMessage((msg) => {
      if (msg.type === "logout") {
        // В продакшене не используем await для broadcast
        logout({ broadcast: false });
      }
      if (msg.type === "login") {
        router.refresh();
      }
    });
  }, []);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const initAuth = async () => {
      const isLoggedOutFlag = localStorage.getItem("isLoggedOut") === "true";
      const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname?.startsWith(route));

      // 1. БЛОКИРОВКА ОФЛАЙН-ВЫХОДА (Для продакшена)
      if (isLoggedOutFlag) {
        // Синхронно чистим всё
        clearAccessToken();
        localStorage.removeItem("isLoggedOut");

        // Отправляем запрос фоном, результат не важен
        fetch("/api/logout", { method: "POST", credentials: "include" }).catch(() => {});

        if (!isPublicRoute) {
          window.location.replace("/auth/phone");
          return;
        }
        finishInitialization();
        return;
      }

      // 2. ЕСЛИ МЫ НА ПУБЛИЧНОЙ СТРАНИЦЕ
      if (isPublicRoute) {
        finishInitialization();
        return;
      }

      // 3. ОБЫЧНАЯ ЛОГИКА
      if (initialToken) {
        setAccessToken(initialToken);
        finishInitialization();
      } else {
        try {
          const res = await fetch("/api/refresh-token", {
            method: "POST",
            credentials: "include",
          });
          if (res.ok) {
            const data = await res.json();
            setAccessToken(data.access);
            finishInitialization();
          } else {
            window.location.replace("/auth/phone");
          }
        } catch (e) {
          console.error("Refresh failed", e);
          window.location.replace("/auth/phone");
        }
      }
    };

    initAuth();
  }, [initialToken, pathname, setAccessToken, clearAccessToken, finishInitialization]);

  // Защитный рендер для продакшена
  if (!isInitialized) {
    const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname?.startsWith(route));
    // На логине показываем контент сразу, в чате — ждем инициализацию
    if (isPublicRoute) return <>{children}</>;
    return null;
  }

  return <>{children}</>;
};
