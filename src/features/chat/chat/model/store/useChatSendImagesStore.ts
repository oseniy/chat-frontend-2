import { create } from "zustand";

import { BasePendingAttachment } from "../types/types";

export type PendingImage = BasePendingAttachment & {
  id: number;
  type: string;
  previewUrl: string;
};

type SendImageState = {
  text: string;
  images: PendingImage[];

  setText: (text: string) => void;

  addImages: (files: File[]) => void;
  removeImage: (id: number) => void;
  clear: () => void;
};

export const useSendImageStore = create<SendImageState>((set) => ({
  text: "",
  images: [],

  setText: (text) => set({ text }),

  addImages: (files) =>
    set((state) => {
      const remaining = 4 - state.images.length;
      const nextFiles = files.slice(0, remaining);

      const mapped = nextFiles.map((file) => ({
        id: Date.now() + Math.random(),
        file,
        type: file.type,
        previewUrl: URL.createObjectURL(file),
      }));

      return { images: [...state.images, ...mapped] };
    }),

  removeImage: (id) =>
    set((state) => ({
      images: state.images.filter((img) => img.id !== id),
    })),

  clear: () => set({ text: "", images: [] }),
}));
