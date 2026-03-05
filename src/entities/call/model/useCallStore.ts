import { create } from "zustand";

import { sendWSRequest } from "@/shared/api/ws/wsClient";

interface CallState {
  pc: RTCPeerConnection | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  callStatus: "idle" | "ringing" | "calling" | "connected";
  remoteUserId: string | null;

  makeCall: (targetUserId: string) => Promise<void>;
  handleIncomingOffer: (sdp: RTCSessionDescriptionInit, fromUserId: string) => Promise<void>;
  handleRemoteAnswer: (sdp: RTCSessionDescriptionInit) => Promise<void>;
  handleIceCandidate: (candidate: RTCIceCandidateInit) => Promise<void>;
  endCall: (shouldNotify: boolean) => void;
}

const iceConfig = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export const useCallStore = create<CallState>((set, get) => ({
  pc: null,
  localStream: null,
  remoteStream: null,
  callStatus: "idle",
  remoteUserId: null,

  makeCall: async (targetUserId) => {
    const pc = new RTCPeerConnection(iceConfig);
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendWSRequest("rtc_candidate", {
          candidate: event.candidate,
          to_user_id: targetUserId,
        });
      }
    };

    pc.ontrack = (event) => {
      set({ remoteStream: event.streams[0] || null });
    };

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    set({ pc, localStream: stream, remoteUserId: targetUserId, callStatus: "calling" });

    await sendWSRequest("rtc_offer", {
      sdp: offer,
      to_user_id: targetUserId,
    });
  },

  handleIncomingOffer: async (sdp, fromUserId) => {
    const pc = new RTCPeerConnection(iceConfig);
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    // Важно: Сначала вешаем обработчики, потом устанавливаем SDP
    pc.ontrack = (event) => {
      set({ remoteStream: event.streams[0] || null });
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendWSRequest("rtc_candidate", {
          candidate: event.candidate,
          to_user_id: fromUserId,
        });
      }
    };

    await pc.setRemoteDescription(new RTCSessionDescription(sdp));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    set({ pc, localStream: stream, remoteUserId: fromUserId, callStatus: "connected" });

    await sendWSRequest("rtc_answer", {
      sdp: answer,
      to_user_id: fromUserId,
    });
  },

  handleRemoteAnswer: async (sdp) => {
    const { pc } = get();
    if (pc) {
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      set({ callStatus: "connected" });
    }
  },

  handleIceCandidate: async (candidate) => {
    const { pc } = get();
    if (pc) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.error("Error adding ice candidate", e);
      }
    }
  },

  endCall: (shouldNotify) => {
    const { pc, localStream, remoteUserId } = get();

    localStream?.getTracks().forEach((track) => track.stop());
    pc?.close();

    if (shouldNotify && remoteUserId) {
      sendWSRequest("rtc_hangup", { to_user_id: remoteUserId });
    }

    set({
      pc: null,
      localStream: null,
      remoteStream: null,
      callStatus: "idle",
      remoteUserId: null,
    });
  },
}));
