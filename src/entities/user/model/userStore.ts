import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserState {
  userId: string | null;
  setUserId: (id: string) => void;
  reset: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      userId: null,
      setUserId: (userId) => set({ userId }),
      reset: () => set({ userId: null }),
    }),
    {
      name: "user-storage",
      partialize: (state) => ({
        userId: state.userId,
      }),
    },
  ),
);
