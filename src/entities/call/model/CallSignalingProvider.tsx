"use client";

import { ReactNode, useEffect } from "react";

import { useCallStore } from "@/entities/call/model/useCallStore";
import { subscribeToWS } from "@/shared/api/ws/wsClient";

// Описываем интерфейсы для того, что приходит в "object"
interface RTCPayload {
  sdp: RTCSessionDescriptionInit;
  fromUserId: string;
  candidate: RTCIceCandidateInit;
}

export const CallSignalingProvider = ({ children }: { children: ReactNode }) => {
  useEffect(() => {
    const unsubscribe = subscribeToWS((data) => {
      const { action } = data;
      // Приводим object к нашему типу для доступа к полям
      const payload = data.object as RTCPayload;

      switch (action) {
        case "rtc_offer":
          useCallStore.getState().handleIncomingOffer(payload.sdp, payload.fromUserId);
          break;

        case "rtc_answer":
          useCallStore.getState().handleRemoteAnswer(payload.sdp);
          break;

        case "rtc_candidate":
          useCallStore.getState().handleIceCandidate(payload.candidate);
          break;

        case "rtc_hangup":
          useCallStore.getState().endCall(false);
          break;
      }
    });

    return () => {
      // Чтобы ESLint не ругался на console.log, используем console.warn
      console.warn("CallSignalingProvider: unsubscribed");
      unsubscribe();
    };
  }, []);

  return <>{children}</>;
};
