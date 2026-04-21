import { useChatStore } from "@/entities/chat/model/useChatStore";
import { useContactStore } from "@/entities/contact/model/store";
import { useUserStore } from "@/entities/user/model/userStore";
import { useChatListStore } from "@/features/chatList/model/useChatListStore";

import { broadcastLogout } from "./authChannel";
import { getQueryClient } from "./getQueryClient";
import { useAuthStore } from "./store";
import { disconnectWS } from "./ws/wsClient";

export const logout = async (options?: { broadcast?: boolean }) => {
  const { broadcast = true } = options ?? {};

  // 1. Ставим метку
  localStorage.setItem("isLoggedOut", "true");

  // 2. Чистим стейты (синхронно)
  useAuthStore.getState().clearAccessToken();
  useUserStore.getState().reset();
  useChatListStore.getState().reset();
  useChatStore.getState().reset();
  useContactStore.getState().reset();
  getQueryClient().clear();

  if (broadcast) broadcastLogout();
  disconnectWS();

  // 3. Пытаемся стукнуть в API (без await)
  fetch("/api/logout", { method: "POST", credentials: "include" }).catch(() => {});

  // 4. РЕДИРЕКТ С ПРОВЕРКОЙ
  // Если мы уже на странице авторизации, НЕ ПЕРЕЗАГРУЖАЕМ её
  if (!window.location.pathname.startsWith("/auth")) {
    window.location.href = "/auth/";
  }
};
