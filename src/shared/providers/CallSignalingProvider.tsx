"use client";

import { ReactNode, useEffect } from "react";

import { useCallStore } from "@/entities/call/model/useCallStore";
import { CallOverlay } from "@/entities/call/ui/CallOverlay";
import { useChatStore } from "@/entities/chat/model/useChatStore";
import { subscribeToWS } from "@/shared/api/ws/wsClient";

export const CallSignalingProvider = ({ children }: { children: ReactNode }) => {
  useEffect(() => {
    const unsubscribe = subscribeToWS((data: Record<string, unknown>) => {
      const action = data.action as string;
      if (!action || action === "new_status_user") return;

      const obj = (data.object as Record<string, unknown>) || {};

      // Безопасное получение myId
      interface ChatStoreState {
        currentUserId?: string;
        user?: { uid?: string };
      }
      const chatState = useChatStore.getState() as unknown as ChatStoreState;
      const myId = String(chatState?.currentUserId || chatState?.user?.uid || "");

      const fromId = String(obj.from_user || obj.from_user_uid || data.from_user || "");
      const toId = String(obj.to_user || obj.to_user_uid || "");

      // ИЗВЛЕЧЕНИЕ UID СТРОГО ПО СХЕМЕ: obj.message_rtc.uid или obj.message_rtc_uid
      const messageRtc = obj.message_rtc as Record<string, unknown> | undefined;
      const serverRtcUid = String(messageRtc?.uid || obj.message_rtc_uid || "");

      const incomingRequestUid = String(data.request_uid || "");

      const isMe = fromId === myId && fromId !== "";
      const isForMe = toId === myId;
      const callStore = useCallStore.getState();
      const currentStatus = callStore.callStatus;

      if (isMe) {
        // Логика для инициатора вызова
        if (action === "offer_call" && serverRtcUid) {
          if (currentStatus === "calling") {
            console.warn("🎯 [SENDER] UID сессии подтвержден:", serverRtcUid);
            useCallStore.setState({ messageRtcUid: serverRtcUid });
          }
        }

        // КРИТИЧЕСКИЙ ФИКС: Разрешаем call_completion проходить дальше,
        // даже если отправитель - мы, чтобы закрыть CallOverlay
        if (action !== "answer_call" && action !== "call_completion") {
          return;
        }
      }

      switch (action) {
        case "offer_call": {
          if (currentStatus !== "idle") {
            console.warn("⚠️ Линия занята.");
            return;
          }

          if (isForMe && obj.offer_sdp) {
            console.warn("📩 [RECEIVER] Получен входящий вызов:", serverRtcUid);

            useCallStore.setState({
              messageRtcUid: serverRtcUid,
              offerRequestUid: incomingRequestUid,
              callFromUser: fromId,
              callToUser: toId,
            });

            callStore.handleIncomingOffer(obj.offer_sdp as string, fromId, serverRtcUid, toId);
          }
          break;
        }

        case "answer_call":
          if (obj.answer_sdp) {
            console.warn("✅ [SENDER] Ответ получен, соединяем...");
            callStore.handleRemoteAnswer(obj.answer_sdp as string);
          }
          break;

        case "ice_candidate":
          if (currentStatus === "idle") return;

          // Проверяем соответствие сессии
          if (!serverRtcUid || serverRtcUid === callStore.messageRtcUid) {
            let cand = obj.ice_candidate;
            if (typeof cand === "string") {
              try {
                cand = JSON.parse(cand);
              } catch {
                /* ignore */
              }
            }
            if (cand) {
              callStore.handleIceCandidate(cand as RTCIceCandidateInit);
            }
          }
          break;

        case "call_completion": {
          console.warn("🏁 Сигнал завершения (type):", obj.type_complete);

          // Проверяем, что завершается именно текущий активный звонок
          const isSameCall = !serverRtcUid || serverRtcUid === callStore.messageRtcUid;

          if (isSameCall || currentStatus !== "idle") {
            // false - чтобы не отправлять сигнал повторно, так как мы его получили
            useCallStore.getState().endCall(false);
          }
          break;
        }
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
