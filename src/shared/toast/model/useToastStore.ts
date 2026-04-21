import { create } from "zustand";

type ToastState = {
  isOpen: boolean;
  message: string;
  open: (message: string) => void;
  close: () => void;
};

export const useToastStore = create<ToastState>((set) => ({
  isOpen: false,
  message: "",
  open: (message) =>
    set({
      isOpen: true,
      message,
    }),
  close: () =>
    set({
      isOpen: false,
      message: "",
    }),
}));
