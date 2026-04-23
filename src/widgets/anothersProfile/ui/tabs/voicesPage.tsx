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

  if (isLoadingMedia && isEmpty) {
    return <div className="text-muted-foreground p-10 text-center text-sm">Загрузка...</div>;
  }

  return (
    <div className={cn("flex flex-1 flex-col overflow-y-auto", className)}>
      {isEmpty ? (
        <div className="text-muted-foreground p-10 text-center text-sm">
          Голосовых сообщений нет
        </div>
      ) : (
        voiceMessages.map((item, index) => (
          <React.Fragment key={item.id}>
            <div className="group flex items-center gap-3 p-4 transition-colors hover:bg-black/5">
              <div className="min-w-0 flex-1">
                <AudioMessage
                  file={item.file}
                  isMine={false}
                  time={item.time}
                  status={"read" as AudioMessageStatus}
                  className="bg-transparent p-0"
                />
              </div>
            </div>

            {/* Точная копия линии из FilesPage */}
            {index < voiceMessages.length - 1 && <div className="mx-4 border-b border-black/30" />}
          </React.Fragment>
        ))
      )}
    </div>
  );
};
