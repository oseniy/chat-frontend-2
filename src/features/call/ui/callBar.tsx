"use client";

import { formatDuration } from "../lib/formatDuration";
import { useCallDuration } from "../lib/useCallDuration";
import { useCallStore } from "../model/callStore";
import { CallStatus } from "../model/types";
import { SignalIcon } from "./icons";

const STATUS_TEXT: Record<CallStatus, string> = {
  idle: "",
  outgoing: "Вызов",
  incoming: "Входящий",
  connecting: "Соединение",
  active: "",
  ended: "Завершён",
  error: "Ошибка",
};

export const CallBar = () => {
  const session = useCallStore((s) => s.session);
  const layoutMode = useCallStore((s) => s.layoutMode);
  const setLayoutMode = useCallStore((s) => s.setLayoutMode);
  const duration = useCallDuration();

  if (!session || layoutMode !== "minimized") return null;
  if (session.status === "incoming" || session.status === "idle") return null;

  const isActive = session.status === "active";
  const handleClick = () => setLayoutMode("window");

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Развернуть окно звонка"
      className="bg-green hover:bg-green-dark flex h-11 w-full items-center justify-between gap-2.5 rounded-b-md px-4 py-2.5 text-white transition-colors"
    >
      <span className="truncate text-base font-semibold">{session.peer.name}</span>
      <span className="flex items-center gap-1 tabular-nums">
        <SignalIcon />
        <span className="text-sm tracking-[0.01em]">
          {isActive ? formatDuration(duration) : STATUS_TEXT[session.status]}
        </span>
      </span>
    </button>
  );
};
