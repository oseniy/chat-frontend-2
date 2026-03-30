import React, { useEffect, useMemo, useRef } from "react";

import { useChatStore } from "@/entities/chat/model/useChatStore";
import { MappedMessageFile } from "@/features/chat/chat/model/types/mappedTypes";
import { cn } from "@/shared/shadcn/lib/utils";
import ImageGallery from "@/shared/ui/ImageGallery/ImageGallery";

type MediaPageProps = {
  className?: string;
  chatKey?: string;
};

export const MediaPage: React.FC<MediaPageProps> = ({ className, chatKey: chatKeyProp }) => {
  const media = useChatStore((state) => state.media);
  const isLoadingMedia = useChatStore((state) => state.isLoadingMedia);
  const fetchMedia = useChatStore((state) => state.fetchMedia);
  const storeChatKey = useChatStore((state) => state.chatKey);

  const effectiveChatKey = chatKeyProp ?? storeChatKey;
  const lastFetchedKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (effectiveChatKey && effectiveChatKey !== lastFetchedKeyRef.current) {
      lastFetchedKeyRef.current = effectiveChatKey;
      fetchMedia(effectiveChatKey);
    }
  }, [effectiveChatKey, fetchMedia]);

  const formattedImages = useMemo(() => {
    const seen = new Set<string>();

    return media
      .filter((file) => file.fileType?.startsWith("image/"))
      .map((file: MappedMessageFile & { file_url?: string }) => ({
        id: file.uid,
        src: file.file_url || file.fileUrl || "",
      }))
      .filter((img) => {
        if (!img.src || seen.has(img.src)) return false;
        seen.add(img.src);
        return true;
      });
  }, [media]);

  const isEmpty = formattedImages.length === 0;

  return (
    <div className={cn("flex h-full w-full flex-col", className)}>
      {/* Показываем лоадер только при ПЕРВОЙ загрузке */}
      {isLoadingMedia && isEmpty ? (
        <div className="text-muted-foreground flex flex-1 items-center justify-center text-sm">
          Загрузка медиа...
        </div>
      ) : isEmpty ? (
        <div className="text-muted-foreground flex flex-1 items-center justify-center text-sm">
          Медиа пока нет
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <ImageGallery images={formattedImages} />
        </div>
      )}
    </div>
  );
};
