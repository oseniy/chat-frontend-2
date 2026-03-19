"use client";

import { ReactNode, useEffect } from "react";

import { useChatStore } from "@/entities/chat/model/useChatStore";
import { subscribeToWS } from "@/shared/api/ws/wsClient";

import { CallOverlay } from "../ui/CallOverlay";
import { useCallStore } from "./useCallStore";

export const CallSignalingProvider = ({ children }: { children: ReactNode }) => {
  useEffect(() => {
    const unsubscribe = subscribeToWS((data: Record<string, unknown>) => {
      const action = data.action as string;
      if (!action || action === "new_status_user") return;

      const obj = (data.object as Record<string, unknown>) || {};

      // Исправлено: безопасное получение myId без any
      const chatState = useChatStore.getState() as unknown as Record<
        string,
        { uid?: string } | string | undefined
      >;
      const myId = String(
        chatState.currentUserId || (chatState.user as { uid?: string })?.uid || "",
      );

      const fromId = String(obj.from_user || obj.from_user_uid || data.from_user || "");
      const toId = String(obj.to_user || obj.to_user_uid || "");

      const messageRtc = obj.message_rtc as Record<string, string> | undefined;
      const serverRtcUid = String(messageRtc?.uid || obj.message_rtc_uid || "");
      const incomingRequestUid = String(data.request_uid || "");

      const isMe = fromId === myId && fromId !== "";
      const callStore = useCallStore.getState();
      const currentStatus = callStore.callStatus; // Теперь используется ниже в switch

      if (isMe) {
        // ЛОГИКА ДЛЯ ИНИЦИАТОРА (ЗВОНЯЩЕГО)
        if (action === "offer_call" && serverRtcUid) {
          if (currentStatus === "calling") {
            console.warn("🎯 [SENDER] Фиксируем финальный UID от сервера:", serverRtcUid);
            useCallStore.setState({ messageRtcUid: serverRtcUid });
          }
        }

        // ФИКС: Если это ответ на звонок, НЕ делаем return.
        // Звонящий должен пропустить пакет дальше в switch.
        if (action !== "answer_call") {
          return;
        }
      }

      switch (action) {
        case "offer_call": {
          // Используем currentStatus, чтобы ESLint не ругался на unused var
          if (currentStatus !== "idle") {
            console.warn("⚠️ Линия занята. Игнорируем повторный оффер.");
            return;
          }

          const isForMe = toId === myId;
          if (isForMe && obj.offer_sdp) {
            console.warn("📩 [RECEIVER] ПРИШЕЛ OFFER_CALL:", serverRtcUid);

            useCallStore.setState({
              messageRtcUid: serverRtcUid,
              offerRequestUid: incomingRequestUid,
            });

            callStore.handleIncomingOffer(obj.offer_sdp as string, fromId, serverRtcUid, toId);
          }
          break;
        }

        case "answer_call":
          // Звонящий ловит этот экшен здесь
          if (obj.answer_sdp) {
            console.warn("✅ [SENDER] Получен ответ на звонок, соединяем...");
            callStore.handleRemoteAnswer(obj.answer_sdp as string);
          }
          break;

        case "ice_candidate":
          // Кандидаты принимаются только если UID совпадает (если он уже есть)
          if (!serverRtcUid || serverRtcUid === callStore.messageRtcUid) {
            let cand = obj.ice_candidate;
            if (typeof cand === "string") {
              try {
                cand = JSON.parse(cand);
              } catch {
                /* ignore */
              }
            }
            if (cand) callStore.handleIceCandidate(cand as RTCIceCandidateInit);
          }
          break;

        case "call_completion":
          console.warn("🏁 Звонок завершен удаленной стороной");
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
