import { create } from "zustand";

import { detectAttachmentType } from "../../lib/detectAttachmentType";
import { isAllowedFile } from "../../lib/isAllowedFile";
import { BasePendingAttachment } from "../types/types";

export type AttachmentType = "video" | "audio" | "document";

export type PendingFile = BasePendingAttachment & {
  id: string;
  type: AttachmentType;
};

type SendFilesState = {
  attachments: PendingFile[];

  addFiles: (files: File[]) => void;
  error: string | null;
  setError: (message: string | null) => void;
  remove: (id: string) => void;
  clear: () => void;
};

export const useSendFilesStore = create<SendFilesState>((set) => ({
  attachments: [],
  error: null,

  setError: (message) => set({ error: message }),

  addFiles: async (files) => {
    set({ error: null });

    const validPending: PendingFile[] = [];
    let lastErrorMessage: string | null = null;

    files.forEach((file) => {
      const validation = isAllowedFile(file);
      if (validation.isError) {
        lastErrorMessage = validation.message || "Ошибка валидации";
      } else {
        const type = detectAttachmentType(file);
        validPending.push({
          id: crypto.randomUUID(),
          file,
          type,
          title: file.name,
          weight: file.size,
        });
      }
    });

    if (lastErrorMessage) {
      set({ error: lastErrorMessage });
    }

    if (validPending.length === 0) return;

    set((state) => ({
      attachments: [...state.attachments, ...validPending],
    }));
  },

  remove: (id) =>
    set((state) => ({
      attachments: state.attachments.filter((a) => a.id !== id),
      error: state.attachments.length <= 1 ? null : state.error,
    })),

  clear: () => set({ attachments: [], error: null }),
}));
