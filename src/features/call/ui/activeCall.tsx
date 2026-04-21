"use client";

import { formatDuration } from "../lib/formatDuration";
import { useCallDuration } from "../lib/useCallDuration";
import { useCallStore } from "../model/callStore";
import { CallStatus } from "../model/types";
import { CallAvatar } from "./callAvatar";
import { CallControls } from "./callControls";
import { RemoteAudio } from "./remoteAudio";

const STATUS_LABEL: Record<CallStatus, string> = {
  idle: "",
  outgoing: "Вызов...",
  incoming: "Входящий звонок",
  connecting: "Соединение...",
  active: "",
  ended: "Звонок завершён",
  error: "Ошибка",
};

export const ActiveCall = () => {
  const session = useCallStore((s) => s.session);
  const duration = useCallDuration();

  if (!session) return null;

  const label =
    session.status === "active"
      ? formatDuration(duration)
      : session.endedReason && session.status === "ended"
        ? session.endedReason
        : STATUS_LABEL[session.status];

  return (
    <div
      className="fixed inset-0 z-100 flex flex-col bg-neutral-900 text-white"
      role="dialog"
      aria-label="Активный звонок"
    >
      <RemoteAudio />

      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6">
        <CallAvatar name={session.peer.name} avatarUrl={session.peer.avatarUrl} />
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-2xl font-medium">{session.peer.name}</h2>
          <p className="text-sm text-white/70" aria-live="polite">
            {label}
          </p>
        </div>
      </div>

      <div className="pt-4 pb-[max(2rem,env(safe-area-inset-bottom))]">
        <CallControls />
      </div>
    </div>
  );
};
