// src/store/authStore.ts
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
    // Если мы успешно залогинились (нормально), снимаем флаг выхода
    localStorage.removeItem("isLoggedOut");
    saveTokenToCookie(token).catch(() => {});
  },
  clearAccessToken: () => {
    set({ accessToken: null });
    saveTokenToCookie(null).catch(() => {});
  },
  finishInitialization: () => {
    // ПРОВЕРКА: если в localStorage висит флаг выхода,
    // значит мы выходили в офлайне. Стираем токен, который мог прийти из кук.
    if (localStorage.getItem("isLoggedOut") === "true") {
      set({ accessToken: null });
    }
    set({ isInitialized: true });
  },
}));
