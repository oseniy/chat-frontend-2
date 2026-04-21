import MessageSendBtn from "@icons/chat/messageSendBtn.svg";
import Trash from "@icons/sendFiles/trash.svg";
import { useEffect } from "react";

import { useChatStore } from "@/entities/chat/model/useChatStore";
import { useVoiceRecorder } from "@/features/recordVoiceMessage/lib/useVoiceRecorder";
import { Button } from "@/shared/shadcn/ui/button";

import { useSendMessage } from "../../chat/chat/hooks";
import { PendingFile } from "../../chat/chat/model/store/useChatSendFilesStore";

export const mapVoiceToPendingFile = (file: File): PendingFile => {
  return {
    id: "s",
    file,
    type: "audio",
  };
};

export const VoiceRecordBox = () => {
  const { exitVoiceRecord } = useChatStore();
  const sendMessage = useSendMessage();
  const recorder = useVoiceRecorder();

  useEffect(() => {
    recorder.start();

    return () => {
      recorder.cancel();
    };
  }, []);

  const handleSend = async () => {
    const blob = await recorder.stop();

    if (!blob || blob.size === 0) {
      exitVoiceRecord();
      return;
    }

    const file = new File([blob], `voice-${Date.now()}.webm`, {
      type: blob.type || "audio/webm",
    });

    const pendingFile = mapVoiceToPendingFile(file);

    await sendMessage("", [], [pendingFile]);

    exitVoiceRecord();
  };

  const formatTime = (seconds: number) =>
    `${Math.floor(seconds / 60)}:${seconds % 60 < 10 ? "0" : ""}${seconds % 60}`;

  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-2">
        <div className="bg-error h-3 w-3 animate-pulse rounded-full" />
        <span className="subtext">{formatTime(recorder.duration)}</span>
      </div>
      <div className="flex items-center gap-3">
        <Button
          size={"icon"}
          variant="text"
          className="hover:bg-primary-hover h-11 w-11 rounded-md transition-colors duration-300"
          onClick={() => {
            recorder.cancel;
            exitVoiceRecord();
          }}
        >
          <Trash className="text-error h-6 w-6" />
        </Button>
        <Button
          onClick={handleSend}
          size={"icon"}
          variant="text"
          className="hover:bg-primary-hover h-12 w-11 rounded-md transition-colors duration-300"
        >
          <MessageSendBtn className="h-11 w-11" />
        </Button>
      </div>
    </div>
  );
};
