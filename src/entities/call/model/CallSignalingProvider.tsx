"use client";
import { ReactNode, useEffect } from "react";

import { useChatStore } from "@/entities/chat/model/useChatStore";
import { subscribeToWS } from "@/shared/api/ws/wsClient";

import { CallOverlay } from "../ui/CallOverlay";
import { useCallStore } from "./useCallStore";

interface RTCPayload {
  offer_sdp?: string;
  answer_sdp?: string;
  from_user?: string | { uid: string };
  from_user_uid?: string;
  ice_candidate?: string;
}

export const CallSignalingProvider = ({ children }: { children: ReactNode }) => {
  useEffect(() => {
    const unsubscribe = subscribeToWS((data) => {
      const { action, object } = data;
      if (!object) return;

      const payload = object as RTCPayload;
      const myId = useChatStore.getState().currentUserId;
      const fromId =
        typeof payload.from_user === "object"
          ? payload.from_user.uid
          : payload.from_user || payload.from_user_uid;

      // ФИЛЬТР: Не реагируем на свои же сигналы
      if (fromId === myId) return;

      switch (action) {
        case "offer_call":
          if (payload.offer_sdp && fromId) {
            useCallStore.getState().handleIncomingOffer(payload.offer_sdp, fromId);
          }
          break;
        case "answer_call":
          if (payload.answer_sdp) useCallStore.getState().handleRemoteAnswer(payload.answer_sdp);
          break;
        case "ice_candidate":
          if (payload.ice_candidate)
            useCallStore.getState().handleIceCandidate(payload.ice_candidate);
          break;
        case "call_completion":
          useCallStore.getState().endCall(false);
          break;
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <>
      {children}
      <CallOverlay />
    </>
  );
};
