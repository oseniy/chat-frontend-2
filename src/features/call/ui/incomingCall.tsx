"use client";

import { acceptIncomingCall, rejectIncomingCall } from "../lib/callEngine";
import { useCallStore } from "../model/callStore";
import { CallPeerInfo } from "./callPeerInfo";

export const IncomingCall = () => {
  const session = useCallStore((s) => s.session);
  if (!session || session.status !== "incoming") return null;

  const modeLabel = session.mode === "video" ? "Видеозвонок" : "Аудиозвонок";

  return (
    <div
      className="bg-accent absolute top-1/2 left-1/2 z-50 flex h-192.5 w-97 -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-md shadow-[0_2px_12px_rgba(0,0,0,0.2)]"
      role="dialog"
      aria-label="Входящий звонок"
    >
      <CallPeerInfo
        name={session.peer.name}
        avatarUrl={session.peer.avatarUrl}
        statusText={modeLabel}
        variant="light"
      />

      <div className="flex gap-5 px-5 pb-5">
        <button
          type="button"
          onClick={rejectIncomingCall}
          className="bg-call-reject flex h-11 flex-1 items-center justify-center rounded-2xl px-4 py-1.5 text-base text-white transition-opacity hover:opacity-90"
        >
          Отклонить
        </button>
        <button
          type="button"
          onClick={() => void acceptIncomingCall()}
          className="bg-call-accept flex h-11 flex-1 items-center justify-center rounded-2xl px-4 py-1.5 text-base text-white transition-opacity hover:opacity-90"
        >
          Ответить
        </button>
      </div>
    </div>
  );
};
