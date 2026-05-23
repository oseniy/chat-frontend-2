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

  // 2. Достаем токен для авторизации запроса логаута
  const accessToken = useAuthStore.getState().accessToken;

  // 3. Стучим в API эндпоинт бэкенда напрямую (без прокси)
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (accessToken && accessToken !== "null") {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    // Ждем ответа бэка, чтобы браузер успел обработать удаление его HttpOnly кук
    await fetch(`${apiUrl}/api/v1/auth/logout/`, {
      method: "POST",
      headers: headers,
      credentials: "include", // Обязательно для передачи и удаления HttpOnly кук
      body: JSON.stringify({}),
    });

    console.log("Backend auth cookie cleared. 🍪");
  } catch (error) {
    // Если у бэка CORS или 500 — try/catch гасит ошибку, продолжая очистку на клиенте
    console.warn("Backend logout failed or CORS blocked it, continuing client cleanup...", error);
  }

  // 4. Чистим стейты фронтенда
  useAuthStore.getState().clearAccessToken();
  useUserStore.getState().reset();
  useChatListStore.getState().reset();
  useChatStore.getState().reset();
  useContactStore.getState().reset();
  getQueryClient().clear();

  document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
  document.cookie = "is_filled=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";

  // Дополнительно страхуемся очисткой localStorage
  localStorage.removeItem("is_filled");

  if (broadcast) broadcastLogout();

  // 6. Закрываем WebSocket соединение
  disconnectWS();

  // 7. РЕДИРЕКТ С ПРОВЕРКОЙ
  if (!window.location.pathname.startsWith("/auth")) {
    window.location.href = "/auth/";
  }
};
