"use client";

import { useEffect, useRef } from "react";

import { subscribeRemoteStream } from "../lib/callEngine";

/**
 * Скрытый `<audio>`, в который движок отдаёт удалённый MediaStream.
 * Выделен в отдельный компонент, чтобы позже, при видеозвонке, рядом появился
 * аналогичный `RemoteVideo`, использующий тот же механизм подписки.
 */
export const RemoteAudio = () => {
  const ref = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return subscribeRemoteStream((stream) => {
      const el = ref.current;
      if (!el) return;
      el.srcObject = stream;
      if (stream) {
        el.play().catch(() => {
          // Autoplay может быть заблокирован до user-gesture, игнорируем.
        });
      }
    });
  }, []);

  return <audio ref={ref} autoPlay playsInline className="hidden" />;
};
