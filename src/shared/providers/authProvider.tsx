"use client";

import { usePathname, useRouter } from "next/navigation";
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
  const router = useRouter();
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const finishInitialization = useAuthStore((s) => s.finishInitialization);
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const initialized = useRef(false);

  useEffect(() => {
    return onAuthChannelMessage(async (msg) => {
      if (msg.type === "logout") {
        await logout({ broadcast: false });
        router.push("/auth");
      }
      if (msg.type === "login") {
        router.refresh();
      }
    });
  }, [router]);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const initAuth = async () => {
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
          // Вызываем finishInitialization только после попытки refresh
          finishInitialization();
        } else {
          finishInitialization();
        }
      }
    };

    initAuth();
  }, [initialToken, setAccessToken, finishInitialization, pathname]);
  if (!isInitialized) {
    if (!initialToken) return null;
  }

  return <>{children}</>;
};
