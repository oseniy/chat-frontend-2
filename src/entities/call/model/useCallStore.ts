import { create } from "zustand";

import { useChatStore } from "@/entities/chat/model/useChatStore";

import { callService } from "../api/callService";

interface CallState {
  pc: RTCPeerConnection | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  callStatus: "idle" | "ringing" | "calling" | "connected";
  pendingOffer: string | null;
  remoteUserId: string | null;
  messageRtcUid: string | null;
  offerRequestUid: string | null;
  callFromUser: string | null;
  callToUser: string | null;
  // Исправлено: заменили any[] на RTCIceCandidateInit[] (стандарт для WebRTC)
  iceQueue: RTCIceCandidateInit[];

  makeCall: (toUserId: string, iceServers: RTCIceServer[]) => Promise<void>;
  handleIncomingOffer: (
    sdp: string,
    fromUserId: string,
    messageRtcUid: string,
    toUserId: string,
  ) => void;
  acceptCall: (iceServers: RTCIceServer[]) => Promise<void>;
  // Исправлено: заменили any на конкретный тип кандидата
  handleIceCandidate: (candidate: RTCIceCandidateInit) => Promise<void>;
  handleRemoteAnswer: (sdp: string) => Promise<void>;
  endCall: (shouldNotify: boolean) => void;
}

export const useCallStore = create<CallState>((set, get) => ({
  pc: null,
  localStream: null,
  remoteStream: null,
  callStatus: "idle",
  pendingOffer: null,
  remoteUserId: null,
  messageRtcUid: null,
  offerRequestUid: null,
  callFromUser: null,
  callToUser: null,
  iceQueue: [],

  makeCall: async (toUserId, iceServers) => {
    const chatState = useChatStore.getState() as unknown as Record<
      string,
      { uid?: string } | string | undefined
    >;
    const myId = String(chatState.currentUserId || (chatState.user as { uid?: string })?.uid || "");

    if (!toUserId || !myId) return;

    try {
      // 1. Создаем экземпляр соединения
      const pc = new RTCPeerConnection({ iceServers });

      // 2. СРАЗУ кладем его в стор, чтобы handleRemoteAnswer мог его найти
      set({ pc, remoteUserId: toUserId, callStatus: "calling", iceQueue: [] });

      const localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      localStream.getTracks().forEach((t) => pc.addTrack(t, localStream));

      // Обновляем стор стримом
      set({ localStream });

      pc.onicecandidate = (event) => {
        const rtcUid = get().messageRtcUid;
        if (event.candidate && rtcUid) {
          callService.sendSignal("ice_candidate", myId, toUserId, rtcUid, {
            ice_candidate: JSON.stringify(event.candidate.toJSON()),
            uid_user_owner_candidate: myId,
          });
        }
      };

      pc.ontrack = (e) => {
        if (e.streams && e.streams[0]) {
          set({ remoteStream: e.streams[0] });
        }
      };

      // 3. Создаем Offer
      const offer = await pc.createOffer();

      // 4. Устанавливаем LocalDescription (состояние сменится со stable на have-local-offer)
      await pc.setLocalDescription(offer);

      // 5. ТОЛЬКО ПОСЛЕ ЭТОГО отправляем сигнал на сервер
      callService.sendSignal("offer_call", myId, toUserId, "", {
        offer_sdp: offer.sdp,
      });
    } catch (err) {
      console.warn("❌ MakeCall Error:", err);
      get().endCall(false);
    }
  },

  handleIncomingOffer: (sdp, fromUserId, messageRtcUid, toUserId) => {
    if (get().callStatus !== "idle") return;
    set({
      pendingOffer: sdp,
      remoteUserId: fromUserId,
      messageRtcUid,
      callFromUser: fromUserId,
      callToUser: toUserId,
      callStatus: "ringing",
      iceQueue: [],
    });
  },

  acceptCall: async (iceServers) => {
    const state = get();
    if (state.callStatus !== "ringing") return;

    // Исправлено: заменили any на unknown + Record
    const chatState = useChatStore.getState() as unknown as Record<
      string,
      { uid?: string } | string | undefined
    >;
    const myId = String(chatState.currentUserId || (chatState.user as { uid?: string })?.uid || "");

    if (
      !state.callFromUser ||
      !state.callToUser ||
      !state.messageRtcUid ||
      !state.offerRequestUid
    ) {
      return;
    }

    try {
      const pc = new RTCPeerConnection({ iceServers });
      const localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      localStream.getTracks().forEach((t) => pc.addTrack(t, localStream));

      pc.ontrack = (e) => {
        // e.streams — это массив, для srcObject нам нужен только сам объект потока
        if (e.streams && e.streams[0]) {
          set({ remoteStream: e.streams[0] }); // Сохраняем ПЕРВЫЙ элемент напрямую
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate && state.remoteUserId && state.messageRtcUid) {
          callService.sendSignal(
            "ice_candidate",
            myId,
            state.remoteUserId,
            state.messageRtcUid,
            {
              ice_candidate: JSON.stringify(event.candidate.toJSON()),
              uid_user_owner_candidate: myId,
            },
            state.offerRequestUid || undefined,
          );
        }
      };

      await pc.setRemoteDescription(
        new RTCSessionDescription({ type: "offer", sdp: state.pendingOffer! }),
      );
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      callService.sendSignal(
        "answer_call",
        state.callFromUser,
        state.callToUser,
        state.messageRtcUid,
        { answer_sdp: answer.sdp },
        state.offerRequestUid,
      );

      const currentQueue = get().iceQueue;
      for (const cand of currentQueue) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(cand));
        } catch (e) {
          console.error(e);
        }
      }

      set({ pc, localStream, callStatus: "connected", pendingOffer: null, iceQueue: [] });
    } catch (err) {
      console.error("AcceptCall Error", err);
      get().endCall(false);
    }
  },

  handleIceCandidate: async (candidate) => {
    const { pc } = get();
    if (pc && pc.remoteDescription) {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    } else {
      set((state) => ({ iceQueue: [...state.iceQueue, candidate] }));
    }
  },

  handleRemoteAnswer: async (sdp) => {
    const { pc } = get();

    // Проверяем, что pc существует и он НЕ в состоянии stable
    if (pc && pc.signalingState !== "stable") {
      try {
        await pc.setRemoteDescription(new RTCSessionDescription({ type: "answer", sdp }));
        set({ callStatus: "connected" });
        console.warn("✅ [SENDER] Соединение установлено (connected)");
      } catch (e) {
        console.warn("❌ [SENDER] Ошибка setRemoteDescription:", e);
      }
    } else {
      console.warn(
        "⚠️ [SENDER] Пропуск answer: pc не готов или уже в stable. State:",
        pc?.signalingState,
      );
    }
  },

  endCall: (shouldNotify) => {
    const state = get();
    // Исправлено: заменили any на unknown + Record
    const chatState = useChatStore.getState() as unknown as Record<
      string,
      { uid?: string } | string | undefined
    >;
    const myId = String(chatState.currentUserId || (chatState.user as { uid?: string })?.uid || "");

    if (shouldNotify && state.remoteUserId && state.messageRtcUid && myId) {
      callService.sendSignal("call_completion", myId, state.remoteUserId, state.messageRtcUid, {
        type_complete: "success",
        duration: 0,
      });
    }

    state.localStream?.getTracks().forEach((t) => t.stop());
    state.pc?.close();

    set({
      pc: null,
      localStream: null,
      remoteStream: null,
      callStatus: "idle",
      pendingOffer: null,
      remoteUserId: null,
      messageRtcUid: null,
      offerRequestUid: null,
      callFromUser: null,
      callToUser: null,
      iceQueue: [],
    });
  },
}));
