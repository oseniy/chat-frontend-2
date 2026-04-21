import { useEffect, useState } from "react";

import { useCallStore } from "../model/callStore";

const computeSeconds = (connectedAt: number | null, isActive: boolean): number =>
  connectedAt && isActive ? Math.floor((Date.now() - connectedAt) / 1000) : 0;

/**
 * Секунды с момента установления соединения (status === "active").
 * Возвращает 0, пока звонок не подключён.
 */
export const useCallDuration = () => {
  const connectedAt = useCallStore((s) => s.session?.connectedAt ?? null);
  const status = useCallStore((s) => s.session?.status ?? "idle");
  const isActive = status === "active";
  const [seconds, setSeconds] = useState(() => computeSeconds(connectedAt, isActive));

  useEffect(() => {
    if (!isActive || !connectedAt) return;
    const id = window.setInterval(() => {
      setSeconds(Math.floor((Date.now() - connectedAt) / 1000));
    }, 1000);
    return () => window.clearInterval(id);
  }, [connectedAt, isActive]);

  return isActive ? seconds : 0;
};
