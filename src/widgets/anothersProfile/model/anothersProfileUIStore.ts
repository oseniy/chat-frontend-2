import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface AnothersProfileUIState {
  activeSection: "main" | "tab" | "settings" | "invite";
  activeTab: "participants" | "media" | "files" | "voices" | "links" | "settings";
  setActiveSection: (section: "main" | "tab" | "settings" | "invite") => void;
  setActiveTab: (tab: "participants" | "media" | "files" | "voices" | "links" | "settings") => void;
  reset: () => void;
}

// Используем каррирование create<T>()(...) для корректной работы типов с middleware
export const useAnothersProfileUIStore = create<AnothersProfileUIState>()(
  devtools(
    (set) => ({
      isMainActive: true,
      activeSection: "main",
      activeTab: "participants",

      setActiveSection: (section) =>
        set(
          { activeSection: section },
          false,
          "setActiveSection", // Название экшена для DevTools
        ),

      setActiveTab: (tab) =>
        set(
          { activeTab: tab },
          false,
          "setActiveSection", // Название экшена для DevTools
        ),

      reset: () =>
        set(
          { activeSection: "main", activeTab: "participants" },
          false,
          "reset", // Название экшена для DevTools
        ),
    }),
    {
      name: "AnothersProfileUIStore", // Имя стора в панели инструментов
      enabled: process.env.NODE_ENV !== "production", // Включаем только в разработке
    },
  ),
);
