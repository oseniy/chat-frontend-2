"use client";

import { useCallStore } from "../model/callStore";
import { ActiveCall } from "./activeCall";
import { IncomingCall } from "./incomingCall";

/**
 * Корневой компонент, который монтируется один раз в layout и показывает
 * соответствующий UI звонка в зависимости от состояния стора.
 *
 * Расширение под групповой/видео-звонок сводится к добавлению ветки по
 * `session.kind` / `session.mode` здесь.
 */
export const CallManager = () => {
  const status = useCallStore((s) => s.session?.status ?? "idle");

  if (status === "idle") return null;
  if (status === "incoming") return <IncomingCall />;

  return <ActiveCall />;
};
