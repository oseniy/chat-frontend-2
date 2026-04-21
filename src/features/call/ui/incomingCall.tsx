"use client";

import { acceptIncomingCall, rejectIncomingCall } from "../lib/callEngine";
import { useCallStore } from "../model/callStore";
import { CallAvatar } from "./callAvatar";
import { AcceptIcon, HangupIcon } from "./icons";

export const IncomingCall = () => {
  const session = useCallStore((s) => s.session);
  if (!session || session.status !== "incoming") return null;

  const modeLabel = session.mode === "video" ? "Видеозвонок" : "Аудиозвонок";

  return (
    <div
      className="fixed inset-x-0 top-0 z-100 flex justify-center px-3 pt-3"
      role="dialog"
      aria-label="Входящий звонок"
    >
      <div className="desktop:max-w-md flex w-full items-center gap-3 rounded-2xl bg-neutral-900/95 p-3 text-white shadow-xl backdrop-blur">
        <CallAvatar name={session.peer.name} avatarUrl={session.peer.avatarUrl} size="sm" />
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-base font-medium">{session.peer.name}</span>
          <span className="truncate text-xs text-white/70">Входящий • {modeLabel}</span>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            aria-label="Отклонить"
            onClick={rejectIncomingCall}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
          >
            <HangupIcon />
          </button>
          <button
            type="button"
            aria-label="Принять"
            onClick={() => void acceptIncomingCall()}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-green-500 text-white hover:bg-green-600"
          >
            <AcceptIcon />
          </button>
        </div>
      </div>
    </div>
  );
};
