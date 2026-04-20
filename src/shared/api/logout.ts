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

  // 1. Ставим метку выхода для AuthProvider (синхронно)
  localStorage.setItem("isLoggedOut", "true");

  // 2. Очистка кэша React Query (используем getQueryClient)
  const queryClient = getQueryClient();
  queryClient.clear();

  // 3. Сброс всех Zustand сторов (используем все импортированные сторы)
  useAuthStore.getState().clearAccessToken();
  useUserStore.getState().reset();
  useChatListStore.getState().reset();
  useChatStore.getState().reset();
  useContactStore.getState().reset();

  // 4. Чистим клиентские куки, доступные JS
  const expire = "=; Max-Age=0; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  document.cookie = `access_token${expire}`;
  document.cookie = `phone${expire}`;

  // 5. Уведомление других вкладок и закрытие сокетов
  if (broadcast) {
    broadcastLogout();
  }
  disconnectWS();

  fetch("/api/logout", { method: "POST", credentials: "include" }).catch(() => {
    // В оффлайне просто игнорируем ошибку сети
  });

  // 7. Жёсткий редирект для продакшена
  if (typeof window !== "undefined" && !window.location.pathname.startsWith("/auth")) {
    window.location.replace("/auth/phone");
  }
};
