import { create } from "zustand";

import { detectAttachmentType } from "../../lib/detectAttachmentType";
import { getVideoThumbnail } from "../../lib/getVideoThumbnail";
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
  remove: (id: string) => void;
  clear: () => void;
};

export const useSendFilesStore = create<SendFilesState>((set) => ({
  attachments: [],

  addFiles: async (files) => {
    const pending: PendingFile[] = files.filter(isAllowedFile).map((file) => {
      const type = detectAttachmentType(file);
      const id = crypto.randomUUID();

      return {
        id,
        file,
        type,
        title: file.name,
        weight: file.size,
      };
    });

    set((state) => ({
      attachments: [...state.attachments, ...pending],
    }));

    for (const item of pending) {
      if (item.type !== "video") continue;

      try {
        const previewUrl = await getVideoThumbnail(item.file);

        set((state) => ({
          attachments: state.attachments.map((a) => (a.id === item.id ? { ...a, previewUrl } : a)),
        }));
      } catch {
        console.error("Ошибка создания обложки для видео");
      }
    }
  },

  remove: (id) =>
    set((state) => ({
      attachments: state.attachments.filter((a) => a.id !== id),
    })),

  clear: () => set({ attachments: [] }),
}));
