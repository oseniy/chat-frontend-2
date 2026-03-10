import { create } from "zustand";

import { useChatStore } from "@/entities/chat/model/useChatStore";
import { sendWSRequest } from "@/shared/api/ws/wsClient";

interface CallState {
  pc: RTCPeerConnection | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  callStatus: "idle" | "ringing" | "calling" | "connected";
  remoteUserId: string | null;
  pendingOffer: string | null;
  isVideoEnabled: boolean; // Новое состояние

  makeCall: (targetUserId: string) => Promise<void>;
  handleIncomingOffer: (sdp: string, fromUserId: string) => void;
  acceptCall: () => Promise<void>;
  toggleVideo: () => Promise<void>; // Новая функция
  handleRemoteAnswer: (sdp: string) => Promise<void>;
  handleIceCandidate: (candidate: string) => Promise<void>;
  endCall: (shouldNotify: boolean) => void;
}

const iceConfig: RTCConfiguration = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

export const useCallStore = create<CallState>((set, get) => ({
  pc: null,
  localStream: null,
  remoteStream: null,
  callStatus: "idle",
  remoteUserId: null,
  pendingOffer: null,
  isVideoEnabled: false,

  makeCall: async (targetUserId) => {
    try {
      const pc = new RTCPeerConnection(iceConfig);
      // ПО УМОЛЧАНИЮ: video: false
      const stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
      pc.ontrack = (e) => set({ remoteStream: e.streams[0] });

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          sendWSRequest("ice_candidate", {
            to_user_uid: targetUserId,
            from_user_uid: useChatStore.getState().currentUserId,
            ice_candidate: JSON.stringify(event.candidate),
          });
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      set({
        pc,
        localStream: stream,
        remoteUserId: targetUserId,
        callStatus: "calling",
        isVideoEnabled: false,
      });

      sendWSRequest("offer_call", { to_user_uid: targetUserId, offer_sdp: offer.sdp });
    } catch (e) {
      console.error(e);
      set({ callStatus: "idle" });
    }
  },

  handleIncomingOffer: (sdp, fromUserId) => {
    set({ pendingOffer: sdp, remoteUserId: fromUserId, callStatus: "ringing" });
  },

  acceptCall: async () => {
    const { pendingOffer, remoteUserId } = get();
    if (!pendingOffer || !remoteUserId) return;
    try {
      const pc = new RTCPeerConnection(iceConfig);
      // ПО УМОЛЧАНИЮ: video: false
      const stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
      stream.getTracks().forEach((t) => pc.addTrack(t, stream));
      pc.ontrack = (e) => set({ remoteStream: e.streams[0] });

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          sendWSRequest("ice_candidate", {
            to_user_uid: remoteUserId,
            from_user_uid: useChatStore.getState().currentUserId,
            ice_candidate: JSON.stringify(event.candidate),
          });
        }
      };

      await pc.setRemoteDescription(
        new RTCSessionDescription({ type: "offer", sdp: pendingOffer }),
      );
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      set({
        pc,
        localStream: stream,
        callStatus: "connected",
        pendingOffer: null,
        isVideoEnabled: false,
      });
      sendWSRequest("answer_call", { to_user_uid: remoteUserId, answer_sdp: answer.sdp });
    } catch (e) {
      console.error(e);
    }
  },

  toggleVideo: async () => {
    const { localStream, pc, isVideoEnabled } = get();
    if (!localStream || !pc) return;

    if (!isVideoEnabled) {
      // ВКЛЮЧАЕМ КАМЕРУ
      try {
        const videoStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        const videoTrack = videoStream.getVideoTracks()[0];

        // Заменяем или добавляем трек в PeerConnection
        const sender = pc.getSenders().find((s) => s.track?.kind === "video");
        if (sender) {
          sender.replaceTrack(videoTrack);
        } else {
          pc.addTrack(videoTrack, localStream);
        }

        localStream.addTrack(videoTrack);
        set({ isVideoEnabled: true });

        // Повторный оффер (Renegotiation)
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        sendWSRequest("offer_call", { to_user_uid: get().remoteUserId, offer_sdp: offer.sdp });
      } catch (e) {
        console.error("Не удалось включить камеру", e);
      }
    } else {
      // ВЫКЛЮЧАЕМ КАМЕРУ
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.stop();
        localStream.removeTrack(videoTrack);
      }
      set({ isVideoEnabled: false });
    }
  },

  handleRemoteAnswer: async (sdp) => {
    const { pc } = get();
    if (pc) {
      await pc.setRemoteDescription(new RTCSessionDescription({ type: "answer", sdp }));
      set({ callStatus: "connected" });
    }
  },

  handleIceCandidate: async (candidate: string) => {
    const { pc } = get();
    if (pc && pc.remoteDescription && candidate) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(JSON.parse(candidate)));
      } catch (e) {
        console.error(e);
      }
    }
  },

  endCall: (shouldNotify) => {
    const { pc, localStream, remoteUserId } = get();
    localStream?.getTracks().forEach((t) => t.stop());
    pc?.close();
    if (shouldNotify && remoteUserId) {
      sendWSRequest("call_completion", {
        to_user_uid: remoteUserId,
        type_complete: "received",
        duration: 0,
      });
    }
    set({
      pc: null,
      localStream: null,
      remoteStream: null,
      callStatus: "idle",
      remoteUserId: null,
      pendingOffer: null,
      isVideoEnabled: false,
    });
  },
}));
