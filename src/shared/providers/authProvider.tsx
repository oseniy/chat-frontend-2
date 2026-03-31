"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { onAuthChannelMessage } from "../api/authChannel";
import { logout } from "../api/logout";
import { useAuthStore } from "../api/store";

const PUBLIC_ROUTES = [
  "/auth",
  "/auth/phone",
  "/auth/code",
  "/auth/support",
  "/auth/support/success",
];

interface AuthProviderProps {
  children: React.ReactNode;
  initialToken: string | null;
}

export const AuthProvider = ({ children, initialToken }: AuthProviderProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const clearAccessToken = useAuthStore((s) => s.clearAccessToken);
  const finishInitialization = useAuthStore((s) => s.finishInitialization);
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const initialized = useRef(false);

  useEffect(() => {
    return onAuthChannelMessage(async (msg) => {
      if (msg.type === "logout") {
        await logout({ broadcast: false });
        router.push("/auth");
      }
    });
  }, [router]);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const initAuth = async () => {
      // 1. ПРОВЕРКА ОФЛАЙН-ВЫХОДА (Самый важный блок)
      const wasLoggedOut =
        typeof window !== "undefined" && localStorage.getItem("isLoggedOut") === "true";

      if (wasLoggedOut) {
        // Если был выход в офлайне, игнорируем любые токены из кук и чистим стейт
        clearAccessToken();
        finishInitialization();

        const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname?.startsWith(route));
        if (!isPublicRoute) {
          router.replace("/auth/phone");
        }
        return; // Прерываем выполнение, чтобы initialToken не применился ниже
      }

      // 2. ОБЫЧНАЯ ИНИЦИАЛИЗАЦИЯ (если флага выхода нет)
      if (initialToken) {
        setAccessToken(initialToken);
        finishInitialization();
      } else {
        const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname?.startsWith(route));
        if (!isPublicRoute) {
          try {
            const res = await fetch("/api/refresh-token", {
              method: "POST",
              credentials: "include",
            });
            if (res.ok) {
              const data = await res.json();
              setAccessToken(data.access);
            }
          } catch (e) {
            console.error("Client-side hydration refresh failed", e);
          }
          finishInitialization();
        } else {
          finishInitialization();
        }
      }
    };

    initAuth();
  }, [initialToken, setAccessToken, clearAccessToken, finishInitialization, pathname, router]);

  if (!isInitialized) {
    const isOfflineLoggedOut =
      typeof window !== "undefined" && localStorage.getItem("isLoggedOut") === "true";
    // Не рендерим контент, если токена нет ИЛИ если висит флаг принудительного выхода
    if (!initialToken || isOfflineLoggedOut) return null;
  }

  return <>{children}</>;
};
