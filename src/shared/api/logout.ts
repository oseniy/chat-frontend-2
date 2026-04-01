import { Mutate, StoreApi } from "zustand";

import { useChatStore } from "@/entities/chat/model/useChatStore";
import { useContactStore } from "@/entities/contact/model/store";
import { useUserStore } from "@/entities/user/model/userStore";
import { useChatListStore } from "@/features/chatList/model/useChatListStore";

import { broadcastLogout } from "./authChannel";
import { getQueryClient } from "./getQueryClient";
import { useAuthStore } from "./store";
import { disconnectWS } from "./ws/wsClient";

// Тип для стора с поддержкой persist, чтобы избежать 'any'
type StoreWithPersist = Mutate<StoreApi<unknown>, [["zustand/persist", unknown]]>;

export const logout = async (options?: { broadcast?: boolean }) => {
  const { broadcast = true } = options ?? {};
  const store = useAuthStore.getState();
  const queryClient = getQueryClient();

  if (!store.accessToken) {
    return;
  }

  // Ставим метку для AuthProvider (сработает в офлайне)
  localStorage.setItem("isLoggedOut", "true");

  queryClient.clear();

  // Безопасная очистка localStorage для сторов с persist без использования any
  (useUserStore as unknown as StoreWithPersist).persist?.clearStorage();
  (useAuthStore as unknown as StoreWithPersist).persist?.clearStorage();

  // Чистим состояния в памяти
  store.clearAccessToken();
  useUserStore.getState().reset();
  useChatListStore.getState().reset();
  useChatStore.getState().reset();
  useContactStore.getState().reset();

  // Чистим client-side куки повторно для гарантии
  document.cookie = "phone=; Max-Age=0; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  document.cookie = "access_token=; Max-Age=0; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  document.cookie = "refresh_token=; Max-Age=0; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

  disconnectWS();

  if (broadcast) {
    broadcastLogout();
  }

  try {
    // серверный логаут для httpOnly refresh token
    await fetch("/api/logout", { method: "POST", credentials: "include" });
    localStorage.removeItem("isLoggedOut");
  } catch {
    // игнорируем ошибки сети (флаг isLoggedOut останется в localStorage)
  } finally {
    // Принудительный редирект для сброса стейта
    window.location.href = "/auth";
  }
};
