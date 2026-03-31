import { create } from "zustand";

import { saveTokenToCookie } from "./actions/saveTokenToCookie";

interface AuthState {
  accessToken: string | null;
  isInitialized: boolean;
  setAccessToken: (token: string) => void;
  clearAccessToken: () => void;
  finishInitialization: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  isInitialized: false,
  setAccessToken: (token) => {
    set({ accessToken: token });
    // Убираем флаг выхода, если пользователь успешно залогинился
    localStorage.removeItem("isLoggedOut");
    saveTokenToCookie(token).catch((err) => {
      console.error("Failed to sync token with cookies", err);
    });
  },
  clearAccessToken: () => {
    set({ accessToken: null });

    // Ставим флаг в localStorage (он доступен в офлайне)
    localStorage.setItem("isLoggedOut", "true");

    // Стираем доступные куки
    document.cookie = "access_token=; Max-Age=0; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "refresh_token=; Max-Age=0; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "phone=; Max-Age=0; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

    saveTokenToCookie(null).catch((err) => {
      console.error("Failed to delete token from cookies", err);
    });
  },
  finishInitialization: () => {
    // Если при загрузке приложения видим флаг принудительного выхода,
    // сбрасываем токен, даже если он восстановился из кук/хранилища.
    if (localStorage.getItem("isLoggedOut") === "true") {
      set({ accessToken: null });
    }
    set({ isInitialized: true });
  },
}));
