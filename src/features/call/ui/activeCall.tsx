"use client";

import Image from "next/image";

import { cn } from "@/shared/shadcn/lib/utils";
import ProfilePhoto from "@/shared/ui/icons/chat/header/profilePhoto.svg";

import { hangupCall, setLocalMuted } from "../lib/callEngine";
import { formatDuration } from "../lib/formatDuration";
import { useCallDuration } from "../lib/useCallDuration";
import { useCallStore } from "../model/callStore";
import { CallStatus } from "../model/types";
import { CallingDots } from "./callingDots";
import { HangupButton } from "./hangupButton";
import { CloseIcon, ContractIcon, ExpandIcon } from "./icons";
import { MuteButton } from "./muteButton";
import { RemoteAudio } from "./remoteAudio";

const STATUS_LABEL: Record<CallStatus, string> = {
  idle: "",
  outgoing: "Вызов",
  incoming: "Входящий звонок",
  connecting: "Соединение",
  active: "",
  ended: "Звонок завершён",
  error: "Ошибка",
};

export const ActiveCall = () => {
  const session = useCallStore((s) => s.session);
  const layoutMode = useCallStore((s) => s.layoutMode);
  const setLayoutMode = useCallStore((s) => s.setLayoutMode);
  const isMuted = useCallStore((s) => s.isMuted);
  const duration = useCallDuration();

  if (!session) return null;
  if (layoutMode === "minimized") return <RemoteAudio />;

  const isFullscreen = layoutMode === "fullscreen";

  const statusText =
    session.endedReason && session.status === "ended"
      ? session.endedReason
      : STATUS_LABEL[session.status];
  const showTimer = session.status === "active";
  const showDots = !showTimer && session.status !== "ended" && session.status !== "error";

  const handleToggleFullscreen = () => {
    setLayoutMode(isFullscreen ? "window" : "fullscreen");
  };

  const handleMinimize = () => {
    setLayoutMode("minimized");
  };

  return (
    <div
      className={cn(
        "bg-primary-dark z-50 flex flex-col overflow-hidden text-white shadow-[0_2px_12px_rgba(0,0,0,0.2)]",
        isFullscreen
          ? "absolute inset-0 rounded-md"
          : "fixed top-[calc(50%-770px/2+40px)] left-[calc(50%-388px/2)] h-192.5 w-97 rounded-lg",
      )}
      role="dialog"
      aria-label="Активный звонок"
    >
      <RemoteAudio />

      <button
        type="button"
        aria-label={isFullscreen ? "Свернуть в окно" : "Открыть на весь экран"}
        onClick={handleToggleFullscreen}
        className="absolute top-5 left-5 flex h-9 w-9 items-center justify-center rounded-full text-white transition-colors hover:bg-white/15"
      >
        {isFullscreen ? <ContractIcon /> : <ExpandIcon />}
      </button>

      <button
        type="button"
        aria-label="Свернуть звонок"
        onClick={handleMinimize}
        className="absolute top-5 right-5 flex h-9 w-9 items-center justify-center rounded-full text-white transition-colors hover:bg-white/15"
      >
        <CloseIcon />
      </button>

      <div className="flex flex-1 flex-col items-center justify-center gap-11 px-4">
        <div className="bg-primary-third flex h-40 w-40 shrink-0 items-center justify-center rounded-full p-3">
          <div className="relative h-full w-full overflow-hidden rounded-full bg-white/10">
            {session.peer.avatarUrl ? (
              <Image
                src={session.peer.avatarUrl}
                alt={session.peer.name}
                fill
                sizes="136px"
                className="object-cover"
              />
            ) : (
              <ProfilePhoto className="h-full w-full text-white/80" />
            )}
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 px-4">
          <h2 className="text-center text-2xl font-medium tracking-[0.01em] text-white">
            {session.peer.name}
          </h2>
          <div
            className="flex items-center justify-center gap-0.5 text-base text-white"
            aria-live="polite"
          >
            {showTimer ? (
              <span>{formatDuration(duration)}</span>
            ) : (
              <>
                <span>{statusText}</span>
                {showDots && <CallingDots />}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex h-23.5 items-center justify-center rounded-t-4xl">
        <div className="flex items-center gap-4">
          <MuteButton isMuted={isMuted} onClick={() => setLocalMuted(!isMuted)} />
          <HangupButton onClick={hangupCall} />
        </div>
      </div>
    </div>
  );
};
