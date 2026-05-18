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

  // 1. Ставим метку выхода в офлайне
  localStorage.setItem("isLoggedOut", "true");

  // 2. Стучим в новый API эндпоинт бэкенда для очистки HttpOnly cookies (Пункт 3 требований)
  // Делаем это ДО закрытия сокета и очистки стейтов, чтобы токен авторизации еще был доступен
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
    // Отправляем credentials, чтобы браузер прикрепил куки к запросу
    await fetch(`${apiUrl}/api/v1/auth/logout/`, {
      method: "POST",
      credentials: "include",
    });
    console.log("Backend auth cookie cleared. 🍪");
  } catch (error) {
    console.error("Failed to call backend logout endpoint:", error);
  }

  // 3. Чистим стейты (синхронно)
  useAuthStore.getState().clearAccessToken();
  useUserStore.getState().reset();
  useChatListStore.getState().reset();
  useChatStore.getState().reset();
  useContactStore.getState().reset();
  getQueryClient().clear();

  if (broadcast) broadcastLogout();

  // 4. Закрываем WebSocket соединение и очищаем интервалы пинга
  disconnectWS();

  // 5. РЕДИРЕКТ С ПРОВЕРКОЙ
  // Если мы уже на странице авторизации, НЕ ПЕРЕЗАГРУЖАЕМ её
  if (!window.location.pathname.startsWith("/auth")) {
    window.location.href = "/auth/";
  }
};
