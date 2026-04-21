import { v4 as uuidv4 } from "uuid";

import {
  sendCallAnswer,
  sendCallBusy,
  sendCallHangup,
  sendCallIce,
  sendCallOffer,
  sendCallReject,
} from "../api/signaling";
import { useCallStore } from "../model/callStore";
import {
  CallAnswerPayload,
  CallEndPayload,
  CallIcePayload,
  CallMode,
  CallOfferPayload,
  CallPeer,
} from "../model/types";
import { CALL_AUDIO_CONSTRAINTS, CALL_ICE_SERVERS } from "./constants";

/**
 * Движок звонка: хранит текущее `RTCPeerConnection`, локальный/удалённый стримы
 * и умеет обслуживать весь цикл (offer/answer/ICE/hangup).
 *
 * Модульный стейт (а не React-хук) нужен, потому что соединение должно
 * переживать перерендеры и быть доступно и из UI, и из обработчиков WS.
 *
 * Сейчас используется только в режиме `audio`; `video` добавится сменой
 * `mediaConstraintsFor(mode)` и подключением видео-UI.
 */

type PendingCall = {
  callId: string;
  peerUid: string;
  peer: CallPeer;
  mode: CallMode;
  offer: RTCSessionDescriptionInit;
  ownerUid: string;
};

let pc: RTCPeerConnection | null = null;
let localStream: MediaStream | null = null;
let remoteStream: MediaStream | null = null;
let currentCallId: string | null = null;
let currentOwnerUid: string | null = null;
let pendingIncoming: PendingCall | null = null;

const remoteStreamListeners = new Set<(stream: MediaStream | null) => void>();

const emitRemoteStream = () => {
  remoteStreamListeners.forEach((cb) => cb(remoteStream));
};

export const subscribeRemoteStream = (cb: (stream: MediaStream | null) => void) => {
  remoteStreamListeners.add(cb);
  cb(remoteStream);
  return () => {
    remoteStreamListeners.delete(cb);
  };
};

const mediaConstraintsFor = (mode: CallMode): MediaStreamConstraints => ({
  audio: CALL_AUDIO_CONSTRAINTS,
  video: mode === "video",
});

const stopLocalStream = () => {
  localStream?.getTracks().forEach((track) => track.stop());
  localStream = null;
};

const stopRemoteStream = () => {
  remoteStream?.getTracks().forEach((track) => track.stop());
  remoteStream = null;
  emitRemoteStream();
};

const closePeerConnection = () => {
  if (!pc) return;
  try {
    pc.onicecandidate = null;
    pc.ontrack = null;
    pc.onconnectionstatechange = null;
    pc.close();
  } catch {
    // noop
  }
  pc = null;
};

const cleanup = () => {
  closePeerConnection();
  stopLocalStream();
  stopRemoteStream();
  currentCallId = null;
  currentOwnerUid = null;
  pendingIncoming = null;
};

const finishCall = (reason?: string) => {
  const store = useCallStore.getState();
  const session = store.session;
  cleanup();
  if (session && session.status !== "ended") {
    store.patchSession({ status: "ended", endedReason: reason });
  }
  // Полный сброс через небольшой тик, чтобы UI успел показать финальный статус.
  setTimeout(() => {
    const s = useCallStore.getState().session;
    if (!s || s.status === "ended") {
      useCallStore.getState().reset();
    }
  }, 1200);
};

const createPeerConnection = (callId: string, peerUid: string, ownerUid: string) => {
  const connection = new RTCPeerConnection({ iceServers: CALL_ICE_SERVERS });

  connection.onicecandidate = (event) => {
    if (!event.candidate) return;
    const payload: CallIcePayload = {
      call_id: callId,
      from_uid: ownerUid,
      to_uid: peerUid,
      candidate: event.candidate.toJSON(),
    };
    void sendCallIce(payload);
  };

  connection.ontrack = (event) => {
    if (!remoteStream) {
      remoteStream = new MediaStream();
    }
    event.streams[0]?.getTracks().forEach((track) => {
      remoteStream!.addTrack(track);
    });
    if (event.streams.length === 0) {
      remoteStream.addTrack(event.track);
    }
    emitRemoteStream();
  };

  connection.onconnectionstatechange = () => {
    const state = connection.connectionState;
    const store = useCallStore.getState();
    if (!store.session) return;

    if (state === "connected") {
      store.setStatus("active");
    } else if (state === "failed") {
      store.patchSession({ status: "error", endedReason: "Соединение прервано" });
      finishCall("failed");
    } else if (state === "disconnected") {
      store.setStatus("connecting");
    } else if (state === "closed") {
      if (store.session.status !== "ended") {
        finishCall("closed");
      }
    }
  };

  return connection;
};

export const startOutgoingCall = async (opts: {
  peer: CallPeer;
  mode: CallMode;
  ownerUid: string;
  ownerName?: string;
  ownerAvatarUrl?: string | null;
}) => {
  if (currentCallId) {
    console.warn("[call] already in a call");
    return;
  }
  const callId = uuidv4();
  const store = useCallStore.getState();

  store.setSession({
    callId,
    kind: "peer",
    mode: opts.mode,
    peer: opts.peer,
    isCaller: true,
    status: "outgoing",
    startedAt: Date.now(),
    connectedAt: null,
  });

  try {
    localStream = await navigator.mediaDevices.getUserMedia(mediaConstraintsFor(opts.mode));
  } catch (error) {
    console.error("[call] getUserMedia failed", error);
    store.patchSession({ status: "error", endedReason: "Нет доступа к микрофону" });
    finishCall("media-denied");
    return;
  }

  currentCallId = callId;
  currentOwnerUid = opts.ownerUid;

  pc = createPeerConnection(callId, opts.peer.uid, opts.ownerUid);
  localStream.getTracks().forEach((track) => pc!.addTrack(track, localStream!));

  try {
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    const offerPayload: CallOfferPayload = {
      call_id: callId,
      from_uid: opts.ownerUid,
      to_uid: opts.peer.uid,
      mode: opts.mode,
      kind: "peer",
      sdp: { type: offer.type, sdp: offer.sdp ?? "" },
      from_name: opts.ownerName,
      from_avatar_url: opts.ownerAvatarUrl ?? null,
    };
    await sendCallOffer(offerPayload);
  } catch (error) {
    console.error("[call] offer failed", error);
    store.patchSession({ status: "error", endedReason: "Не удалось начать звонок" });
    finishCall("offer-failed");
  }
};

/**
 * Вызывается из WS-обработчика, когда пришло приглашение.
 * Показываем UI входящего звонка, но `RTCPeerConnection` создаём только
 * после принятия — чтобы не дёргать микрофон впустую.
 */
export const registerIncomingOffer = (payload: CallOfferPayload, ownerUid: string) => {
  const store = useCallStore.getState();

  if (store.session || currentCallId) {
    // Уже в разговоре — говорим звонящему "занято".
    void sendCallBusy({
      call_id: payload.call_id,
      from_uid: ownerUid,
      to_uid: payload.from_uid,
    });
    return;
  }

  const peer: CallPeer = {
    uid: payload.from_uid,
    name: payload.from_name ?? "Входящий звонок",
    avatarUrl: payload.from_avatar_url ?? null,
  };

  pendingIncoming = {
    callId: payload.call_id,
    peerUid: payload.from_uid,
    peer,
    mode: payload.mode,
    offer: { type: payload.sdp.type, sdp: payload.sdp.sdp },
    ownerUid,
  };

  store.setSession({
    callId: payload.call_id,
    kind: payload.kind,
    mode: payload.mode,
    peer,
    isCaller: false,
    status: "incoming",
    startedAt: Date.now(),
    connectedAt: null,
  });
};

export const acceptIncomingCall = async () => {
  const incoming = pendingIncoming;
  if (!incoming) return;
  const store = useCallStore.getState();

  try {
    localStream = await navigator.mediaDevices.getUserMedia(mediaConstraintsFor(incoming.mode));
  } catch (error) {
    console.error("[call] getUserMedia failed", error);
    void sendCallReject({
      call_id: incoming.callId,
      from_uid: incoming.ownerUid,
      to_uid: incoming.peerUid,
      reason: "media-denied",
    });
    store.patchSession({ status: "error", endedReason: "Нет доступа к микрофону" });
    finishCall("media-denied");
    return;
  }

  currentCallId = incoming.callId;
  currentOwnerUid = incoming.ownerUid;

  pc = createPeerConnection(incoming.callId, incoming.peerUid, incoming.ownerUid);
  localStream.getTracks().forEach((track) => pc!.addTrack(track, localStream!));

  try {
    await pc.setRemoteDescription(incoming.offer);
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    const answerPayload: CallAnswerPayload = {
      call_id: incoming.callId,
      from_uid: incoming.ownerUid,
      to_uid: incoming.peerUid,
      sdp: { type: answer.type, sdp: answer.sdp ?? "" },
    };
    await sendCallAnswer(answerPayload);

    pendingIncoming = null;
    store.setStatus("connecting");
  } catch (error) {
    console.error("[call] answer failed", error);
    store.patchSession({ status: "error", endedReason: "Не удалось принять звонок" });
    finishCall("answer-failed");
  }
};

export const rejectIncomingCall = () => {
  const incoming = pendingIncoming;
  const store = useCallStore.getState();

  if (incoming) {
    void sendCallReject({
      call_id: incoming.callId,
      from_uid: incoming.ownerUid,
      to_uid: incoming.peerUid,
    });
  } else if (store.session) {
    void sendCallReject({
      call_id: store.session.callId,
      from_uid: currentOwnerUid ?? "",
      to_uid: store.session.peer.uid,
    });
  }
  pendingIncoming = null;
  finishCall("rejected");
};

export const hangupCall = () => {
  const store = useCallStore.getState();
  const session = store.session;
  if (session) {
    void sendCallHangup({
      call_id: session.callId,
      from_uid: currentOwnerUid ?? "",
      to_uid: session.peer.uid,
    });
  }
  finishCall("hangup");
};

export const handleRemoteAnswer = async (payload: CallAnswerPayload) => {
  if (!pc || payload.call_id !== currentCallId) return;
  try {
    await pc.setRemoteDescription({ type: payload.sdp.type, sdp: payload.sdp.sdp });
    useCallStore.getState().setStatus("connecting");
  } catch (error) {
    console.error("[call] setRemoteDescription (answer) failed", error);
    finishCall("answer-apply-failed");
  }
};

export const handleRemoteIce = async (payload: CallIcePayload) => {
  if (!pc || payload.call_id !== currentCallId) return;
  try {
    await pc.addIceCandidate(payload.candidate);
  } catch (error) {
    console.warn("[call] addIceCandidate failed", error);
  }
};

export const handleRemoteHangup = (payload: CallEndPayload) => {
  const store = useCallStore.getState();
  if (!store.session || payload.call_id !== store.session.callId) return;
  finishCall(payload.reason ?? "remote-hangup");
};

export const handleRemoteReject = (payload: CallEndPayload) => {
  const store = useCallStore.getState();
  if (!store.session || payload.call_id !== store.session.callId) return;
  store.patchSession({ status: "ended", endedReason: "Звонок отклонён" });
  finishCall("remote-reject");
};

export const handleRemoteBusy = (payload: CallEndPayload) => {
  const store = useCallStore.getState();
  if (!store.session || payload.call_id !== store.session.callId) return;
  store.patchSession({ status: "ended", endedReason: "Абонент занят" });
  finishCall("busy");
};

export const setLocalMuted = (muted: boolean) => {
  if (!localStream) return;
  localStream.getAudioTracks().forEach((track) => {
    track.enabled = !muted;
  });
  useCallStore.getState().setMuted(muted);
};
