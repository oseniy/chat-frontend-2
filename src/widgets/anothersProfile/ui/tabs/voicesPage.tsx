import React, { ComponentProps, useEffect, useMemo, useRef } from "react";

import { useChatStore } from "@/entities/chat/model/useChatStore";
import { AudioBlock } from "@/features/chat/chat/model/messageBlock/types";
import { MappedMessageFile } from "@/features/chat/chat/model/types/mappedTypes";
import { AudioMessage } from "@/features/recordVoiceMessage/ui/audioMessage";
import { cn } from "@/shared/shadcn/lib/utils";

type VoicesPageProps = {
  className?: string;
  chatKey?: string;
};

interface VoiceMessageData {
  id: string;
  file: AudioBlock;
  time: string;
}

type AudioMessageStatus = ComponentProps<typeof AudioMessage>["status"];

export const VoicesPage: React.FC<VoicesPageProps> = ({ className, chatKey: chatKeyProp }) => {
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

  const voiceMessages = useMemo((): VoiceMessageData[] => {
    return media
      .filter((file: MappedMessageFile) => {
        const type = file.fileType || "";
        // Фильтруем аудио и webm (голосовые из браузера)
        return type.startsWith("audio/") || type === "video/webm";
      })
      .map((file: MappedMessageFile) => {
        const audioBlock: AudioBlock = {
          type: "audio",
          item: [
            {
              src: file.fileUrl || "",
              type: "audio",
            },
          ],
        };

        return {
          id: file.uid,
          file: audioBlock,
          time: file.createdAt
            ? new Date(file.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "",
        };
      });
  }, [media]);

  const isEmpty = voiceMessages.length === 0;

  return (
    <div className={cn("flex h-full w-full flex-col", className)}>
      {isLoadingMedia && isEmpty ? (
        <div className="text-muted-foreground flex flex-1 items-center justify-center text-sm">
          Загрузка голосовых...
        </div>
      ) : isEmpty ? (
        <div className="text-muted-foreground flex flex-1 items-center justify-center text-sm">
          Голосовых сообщений нет
        </div>
      ) : (
        <div className="custom-scrollbar flex-1 overflow-y-auto p-4">
          <div className="flex flex-col gap-4">
            {voiceMessages.map((item: VoiceMessageData) => (
              <AudioMessage
                key={item.id}
                file={item.file}
                isMine={false}
                time={item.time}
                status={"read" as AudioMessageStatus}
                className="bg-secondary/20 rounded-xl"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
