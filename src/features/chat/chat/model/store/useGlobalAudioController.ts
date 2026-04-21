import { create } from "zustand";

type AudioControllerState = {
  current: HTMLAudioElement | null;
  setCurrent: (audio: HTMLAudioElement) => void;
  stopCurrent: () => void;
};

export const useGlobalAudioController = create<AudioControllerState>((set, get) => ({
  current: null,

  setCurrent: (audio) => {
    const prev = get().current;

    if (prev && prev !== audio) {
      prev.pause();
      prev.currentTime = 0;
    }

    set({ current: audio });
  },

  stopCurrent: () => {
    const current = get().current;
    if (current) {
      current.pause();
      current.currentTime = 0;
    }
    set({ current: null });
  },
}));
