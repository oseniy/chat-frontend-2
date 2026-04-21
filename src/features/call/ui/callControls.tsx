"use client";

import { cn } from "@/shared/shadcn/lib/utils";

import { hangupCall, setLocalMuted } from "../lib/callEngine";
import { useCallStore } from "../model/callStore";
import { HangupIcon, MicIcon } from "./icons";

export const CallControls = ({ className }: { className?: string }) => {
  const isMuted = useCallStore((s) => s.isMuted);

  return (
    <div className={cn("flex items-center justify-center gap-6", className)}>
      <button
        type="button"
        aria-label={isMuted ? "Включить микрофон" : "Выключить микрофон"}
        aria-pressed={isMuted}
        onClick={() => setLocalMuted(!isMuted)}
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-full transition-colors",
          isMuted ? "bg-white text-black" : "bg-white/15 text-white hover:bg-white/25",
        )}
      >
        <MicIcon muted={isMuted} />
      </button>
      <button
        type="button"
        aria-label="Завершить звонок"
        onClick={hangupCall}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500 text-white transition-colors hover:bg-red-600"
      >
        <HangupIcon />
      </button>
    </div>
  );
};
