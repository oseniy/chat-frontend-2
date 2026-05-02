"use client";

import { useState } from "react";

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
  const [wasActive, setWasActive] = useState(false);
  const [prevStatus, setPrevStatus] = useState(status);

  if (prevStatus !== status) {
    setPrevStatus(status);
    if (status === "idle") setWasActive(false);
    else if (status !== "incoming" && status !== "ended") setWasActive(true);
  }

  if (status === "idle") return null;
  if (status === "incoming") return <IncomingCall />;
  if (status === "ended" && !wasActive) return null;

  return <ActiveCall />;
};
