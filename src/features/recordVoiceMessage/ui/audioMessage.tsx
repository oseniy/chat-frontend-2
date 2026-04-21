import { useEffect, useRef, useState } from "react";

import { cn } from "@/shared/shadcn/lib/utils";
import Play from "@/shared/ui/icons/files/audioPreview.svg";
import Pause from "@/shared/ui/icons/pause.svg";

import { AudioBlock } from "../../chat/chat/model/messageBlock/types";
import { useGlobalAudioController } from "../../chat/chat/model/store/useGlobalAudioController";
import { SendingStatus } from "../../chat/chat/model/types/serverTypes";
import { MessageTimeAndStatus } from "../../chat/chat/ui/messageTimeAndStatus";
import { SpinnerWithX } from "../../chat/chat/ui/spinnerFile";
import { Waveform } from "./waveform";

type AudioMessageProps = {
  file: AudioBlock;
  isMine: boolean;
  time: string;
  status: SendingStatus;
  className?: string;
};

export const AudioMessage: React.FC<AudioMessageProps> = ({
  file,
  isMine,
  time,
  status,
  className,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const controller = useGlobalAudioController();
  const wasPlayingBeforeSeek = useRef(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);

  const src = file.item[0]?.src;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      setCurrent(audio.currentTime);
    };

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onLoaded = () => setDuration(audio.duration || 0);
    const onEnded = () => {
      setIsPlaying(false);
      setCurrent(0);
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!audio.paused) {
      audio.pause();
      return;
    }

    controller.setCurrent(audio);
    try {
      await audio.play();
    } catch {
      controller.stopCurrent();
    }
  };

  const handleSeekStart = () => {
    const audio = audioRef.current;
    if (!audio) return;

    wasPlayingBeforeSeek.current = !audio.paused;
    audio.pause();
  };

  const handleSeek = (p: number) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;

    audio.currentTime = duration * p;
    setCurrent(audio.currentTime);
  };

  const handleSeekEnd = async (p: number) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;

    audio.currentTime = duration * p;

    if (wasPlayingBeforeSeek.current) {
      try {
        await audio.play();
      } catch {
        controller.stopCurrent();
      }
    }
  };

  const progress = duration ? current / duration : 0;

  if (!src) return null;

  return (
    <div className={cn("flex items-center gap-3 rounded-2xl px-3 py-2", className)}>
      <audio ref={audioRef} src={src} preload="metadata" />

      <div className="bg-primary relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full">
        {status === "pending" ? (
          <SpinnerWithX />
        ) : (
          <button onClick={toggle} className="cursor-pointer">
            {isPlaying ? (
              <Pause className="h-10 w-10 text-white" />
            ) : (
              <Play className="h-10 w-10 text-white" />
            )}
          </button>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="relative h-6 w-full">
          <Waveform
            progress={progress}
            onSeekStart={handleSeekStart}
            onSeek={handleSeek}
            onSeekEnd={handleSeekEnd}
          />
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="minitext text-gray">
            {Math.floor((current || duration) / 60)}:
            {Math.floor((current || duration) % 60)
              .toString()
              .padStart(2, "0")}
          </span>

          <MessageTimeAndStatus isMine={isMine} time={time} status={status} isEmpty={false} />
        </div>
      </div>
    </div>
  );
};
