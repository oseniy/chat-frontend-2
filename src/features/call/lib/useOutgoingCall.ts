import { useCallback } from "react";

import { useUserStore } from "@/entities/user/model/userStore";

import { useCallStore } from "../model/callStore";
import { CallMode, CallPeer } from "../model/types";
import { startOutgoingCall } from "./callEngine";

/**
 * Тонкий React-хук для точек входа (например, кнопка «позвонить» в чат-хедере).
 * Вся тяжёлая логика WebRTC лежит в `callEngine`.
 */
export const useOutgoingCall = () => {
  const userId = useUserStore((s) => s.userId);
  const isBusy = useCallStore((s) => s.session !== null);

  const startAudioCall = useCallback(
    (peer: CallPeer) => {
      if (!userId || isBusy) return;
      void startOutgoingCall({
        peer,
        mode: "audio",
        ownerUid: userId,
      });
    },
    [userId, isBusy],
  );

  // Задел под следующие шаги. Видео и группы пока не поддерживаются UI,
  // но сам движок с ними работает — остаётся только расширить компоненты.
  const startCall = useCallback(
    (peer: CallPeer, mode: CallMode) => {
      if (!userId || isBusy) return;
      void startOutgoingCall({ peer, mode, ownerUid: userId });
    },
    [userId, isBusy],
  );

  return { startAudioCall, startCall, isBusy };
};
