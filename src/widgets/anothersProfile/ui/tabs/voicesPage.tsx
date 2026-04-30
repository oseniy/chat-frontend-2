import { Pause, Play } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";

import { useChatStore } from "@/entities/chat/model/useChatStore";
import { MappedMessageFile } from "@/features/chat/chat/model/types/mappedTypes";
import { formatTime } from "@/shared/lib/format-time";
import { formatBytes } from "@/shared/lib/formatBytes";
import { formatDate } from "@/shared/lib/formatDate";
import { cn } from "@/shared/shadcn/lib/utils";

interface ExtendedVoiceFile extends MappedMessageFile {
  firstName?: string;
  lastName?: string;
  authorName?: string;
  duration?: number;
}

/* eslint-disable @typescript-eslint/naming-convention */
const VoiceItem = ({ file, isLast }: { file: MappedMessageFile; isLast: boolean }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const extendedFile = file as ExtendedVoiceFile;

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play().catch(() => {});
    setIsPlaying(!isPlaying);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) setDuration(Math.round(audioRef.current.duration));
  };

  const author = useMemo(() => {
    const full = `${extendedFile.firstName ?? ""} ${extendedFile.lastName ?? ""}`.trim();
    return full || extendedFile.authorName || "Голосовое сообщение";
  }, [extendedFile]);

  return (
    <React.Fragment>
      <div className="group flex cursor-pointer items-center gap-3 p-4 transition-colors hover:bg-black/5">
        <button
          type="button"
          onClick={togglePlay}
          className="bg-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white transition-transform active:scale-95"
        >
          {isPlaying ? (
            <Pause size={20} fill="currentColor" />
          ) : (
            <Play size={20} fill="currentColor" className="ml-0.5" />
          )}
        </button>
        <audio
          ref={audioRef}
          src={file.fileUrl}
          onEnded={() => setIsPlaying(false)}
          onLoadedMetadata={handleLoadedMetadata}
          className="hidden"
          preload="metadata"
        />
        <div className="min-w-0 flex-1">
          <p className="text-foreground truncate text-[14px] leading-tight font-semibold">
            {author}
          </p>
          <p className="text-muted-foreground mt-0.5 text-[12px]">
            {duration > 0 || extendedFile.duration
              ? `${formatTime(duration || extendedFile.duration || 0)} • `
              : `${formatBytes(file.size || 0)} • `}
            {formatDate(file.createdAt)}
          </p>
        </div>
      </div>
      {!isLast && <div className="mx-4 border-b border-black/30" />}
    </React.Fragment>
  );
};
/* eslint-enable @typescript-eslint/naming-convention */

export const VoicesPage: React.FC<{ className?: string; chatKey?: string }> = ({
  className,
  chatKey: chatKeyProp,
}) => {
  const { media, fetchMedia, isLoadingMedia, chatKey: storeKey } = useChatStore();
  const effectiveChatKey = chatKeyProp ?? storeKey;

  useEffect(() => {
    if (effectiveChatKey) fetchMedia(effectiveChatKey);
  }, [effectiveChatKey, fetchMedia]);

  const voiceMessages = useMemo(() => {
    return media.filter((file) => {
      const type = file.fileType?.toLowerCase() || "";
      return type.startsWith("audio/") || type === "video/webm";
    });
  }, [media]);

  if (isLoadingMedia && voiceMessages.length === 0) {
    return <div className="text-muted-foreground p-10 text-center text-sm">Загрузка...</div>;
  }

  return (
    <div className={cn("flex flex-1 flex-col overflow-y-auto", className)}>
      {voiceMessages.length === 0 ? (
        <div className="text-muted-foreground p-10 text-center text-sm">
          Голосовых сообщений нет
        </div>
      ) : (
        voiceMessages.map((file, index) => (
          <VoiceItem key={file.uid} file={file} isLast={index === voiceMessages.length - 1} />
        ))
      )}
    </div>
  );
};
