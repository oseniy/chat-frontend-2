"use client";

import { acceptIncomingCall, rejectIncomingCall } from "../lib/callEngine";
import { useCallStore } from "../model/callStore";
import { CallAvatar } from "./callAvatar";
import { CallPeerInfo } from "./callPeerInfo";

export const IncomingCall = () => {
  const session = useCallStore((s) => s.session);
  if (!session || session.status !== "incoming") return null;

  const modeLabel = session.mode === "video" ? "Видеозвонок" : "Аудиозвонок";
  const onReject = rejectIncomingCall;
  const onAccept = () => void acceptIncomingCall();

  return (
    <>
      <div
        className="desktop:hidden bg-accent absolute top-3 right-3 left-3 z-50 flex flex-col gap-3 rounded-2xl p-3 shadow-[0_2px_12px_rgba(0,0,0,0.2)]"
        role="dialog"
        aria-label="Входящий звонок"
      >
        <div className="flex items-center gap-3">
          <CallAvatar name={session.peer.name} avatarUrl={session.peer.avatarUrl} size="sm" />
          <div className="flex min-w-0 flex-1 flex-col">
            <h3 className="truncate text-base font-semibold text-black">{session.peer.name}</h3>
            <p className="text-sm text-black/60">Входящий звонок</p>
          </div>
        </div>

        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={onReject}
            className="bg-call-reject flex h-10 flex-1 items-center justify-center rounded-2xl px-4 text-sm text-white transition-opacity hover:opacity-90"
          >
            Отклонить
          </button>
          <button
            type="button"
            onClick={onAccept}
            className="bg-call-accept flex h-10 flex-1 items-center justify-center rounded-2xl px-4 text-sm text-white transition-opacity hover:opacity-90"
          >
            Ответить
          </button>
        </div>
      </div>

      <div
        className="bg-accent desktop:flex absolute top-1/2 left-1/2 z-50 hidden h-192.5 w-97 -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-md shadow-[0_2px_12px_rgba(0,0,0,0.2)]"
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
            onClick={onReject}
            className="bg-call-reject flex h-11 flex-1 items-center justify-center rounded-2xl px-4 py-1.5 text-base text-white transition-opacity hover:opacity-90"
          >
            Отклонить
          </button>
          <button
            type="button"
            onClick={onAccept}
            className="bg-call-accept flex h-11 flex-1 items-center justify-center rounded-2xl px-4 py-1.5 text-base text-white transition-opacity hover:opacity-90"
          >
            Ответить
          </button>
        </div>
      </div>
    </>
  );
};
