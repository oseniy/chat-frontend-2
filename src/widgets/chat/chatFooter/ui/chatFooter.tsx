"use client";

import { useChatStore } from "@/entities/chat/model/useChatStore";
import { ForwardBox } from "@/features/chat/chat/ui/forwardBox";
import { ReplyBox } from "@/features/chat/chat/ui/replyBox";
import { SelectBox } from "@/features/chat/chat/ui/selectBox";
import { MessageForm } from "@/features/chat/sendMessage/ui/messageForm";
import { VoiceRecordBox } from "@/features/recordVoiceMessage/ui/voiceRecordBox";
import { useKeyboardOffset } from "@/shared/lib/useKeyboardOffset";
import { cn } from "@/shared/shadcn/lib/utils";

type ChatFooterProps = {
  className?: string;
  onSendMessage: (message: string) => void;
  join?: boolean;
};

export const ChatFooter: React.FC<ChatFooterProps> = ({
  className,
  onSendMessage,
  join = false,
}) => {
  const { isKeyboardOpen } = useKeyboardOffset();
  const { isSelectionMode, forwardTargets, isVoiceRecord, enterVoiceRecord } = useChatStore();

  return (
    <>
      <ReplyBox />
      <ForwardBox />
      <footer
        style={{ paddingBottom: "var(--keyboard-offset)" }}
        className={cn(
          "bg-primary-gray/90 desktop:bg-main-light-gray border-muted @container relative w-full shrink-0 border-t",
          className,
        )}
      >
        {join ? (
          <div className="bg-primary-accent-light absolute bottom-0 left-0 flex min-h-15 w-full flex-row items-center gap-2.5 px-4 py-2 @3xl:left-1/2 @3xl:w-186 @3xl:-translate-x-1/2">
            <span className="text-gray grow text-center text-sm leading-[130%] font-normal tracking-[0.01em] @3xl:text-base">
              Вступите в группу, чтобы открыть доступ к отправке сообщений
            </span>
          </div>
        ) : isSelectionMode ? (
          <SelectBox />
        ) : isVoiceRecord ? (
          <VoiceRecordBox />
        ) : (
          <MessageForm
            onVoiceBtnClick={enterVoiceRecord}
            isKeyboardOpen={isKeyboardOpen}
            onSubmitMessage={onSendMessage}
            isAbleToSendWithoutText={forwardTargets.length > 0}
          />
        )}
      </footer>
    </>
  );
};
