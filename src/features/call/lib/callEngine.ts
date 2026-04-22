import { getIceServers } from "../api/getIceServers";
import {
  sendAnswerCall,
  sendCallCompletion,
  sendCallStateUpdate,
  sendIceCandidate,
  sendOfferCall,
} from "../api/signaling";
import { useCallStore } from "../model/callStore";
import {
  CallAnswerResponse,
  CallCompletionResponse,
  CallIceCandidateResponse,
  CallMode,
  CallOfferResponse,
  CallPeer,
  CallReasonCode,
  CallStateUpdateResponse,
  CallTypeComplete,
} from "../model/types";
import { CALL_AUDIO_CONSTRAINTS, CALL_DEFAULT_ICE_SERVERS } from "./constants";

/**
 * Движок звонка: хранит текущее `RTCPeerConnection`, локальный/удалённый стримы
 * и умеет обслуживать весь цикл (offer/answer/ICE/completion/state_update).
 *
 * Модульный стейт (а не React-хук) нужен, потому что соединение должно
 * переживать перерендеры и быть доступно и из UI, и из обработчиков WS.
 *
 * Сейчас используется только в режиме `audio`; `video` добавится сменой
 * `mediaConstraintsFor(mode)` и подключением видео-UI.
 */

type PendingIncoming = {
  messageRtcUid: string;
  peerUid: string;
  peer: CallPeer;
  mode: CallMode;
  offerSdp: string;
  ownerUid: string;
};

let pc: RTCPeerConnection | null = null;
let localStream: MediaStream | null = null;
let remoteStream: MediaStream | null = null;
let currentMessageRtcUid: string | null = null;
let currentOwnerUid: string | null = null;
let currentPeerUid: string | null = null;
let pendingIncoming: PendingIncoming | null = null;
let isRemoteDescriptionSet = false;
let connectedStateReported = false;
let completionSent = false;

const pendingLocalIce: string[] = [];
const pendingRemoteIce: RTCIceCandidateInit[] = [];

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
    pc.oniceconnectionstatechange = null;
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
  currentMessageRtcUid = null;
  currentOwnerUid = null;
  currentPeerUid = null;
  pendingIncoming = null;
  isRemoteDescriptionSet = false;
  connectedStateReported = false;
  completionSent = false;
  pendingLocalIce.length = 0;
  pendingRemoteIce.length = 0;
};

const finishCall = (reason?: string) => {
  const store = useCallStore.getState();
  const session = store.session;
  cleanup();
  if (session && session.status !== "ended") {
    store.patchSession({ status: "ended", endedReason: reason });
  }
  setTimeout(() => {
    const s = useCallStore.getState().session;
    if (!s || s.status === "ended") {
      useCallStore.getState().reset();
    }
  }, 1200);
};

const resolveIceServers = async (): Promise<RTCIceServer[]> => {
  const result = await getIceServers();
  if (result.success && result.data.length > 0) return result.data;
  return CALL_DEFAULT_ICE_SERVERS;
};

const flushPendingLocalIce = () => {
  if (!currentMessageRtcUid || !currentOwnerUid || !currentPeerUid) return;
  const messageRtcUid = currentMessageRtcUid;
  const ownerUid = currentOwnerUid;
  const peerUid = currentPeerUid;
  while (pendingLocalIce.length > 0) {
    const ice_candidate = pendingLocalIce.shift();
    if (!ice_candidate) continue;
    void sendIceCandidate({
      from_user_uid: ownerUid,
      to_user_uid: peerUid,
      message_rtc_uid: messageRtcUid,
      ice_candidate,
    });
  }
};

const flushPendingRemoteIce = async () => {
  if (!pc || !isRemoteDescriptionSet) return;
  while (pendingRemoteIce.length > 0) {
    const candidate = pendingRemoteIce.shift();
    if (!candidate) continue;
    try {
      await pc.addIceCandidate(candidate);
    } catch (error) {
      console.warn("[call] addIceCandidate (buffered) failed", error);
    }
  }
};

const createPeerConnection = (iceServers: RTCIceServer[]) => {
  const connection = new RTCPeerConnection({ iceServers });

  connection.onicecandidate = (event) => {
    if (!event.candidate) return;
    const ice_candidate = JSON.stringify(event.candidate.toJSON());
    if (!currentMessageRtcUid || !currentOwnerUid || !currentPeerUid) {
      pendingLocalIce.push(ice_candidate);
      return;
    }
    void sendIceCandidate({
      from_user_uid: currentOwnerUid,
      to_user_uid: currentPeerUid,
      message_rtc_uid: currentMessageRtcUid,
      ice_candidate,
    });
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
      reportConnected();
    } else if (state === "failed") {
      reportFailed("peer_connection_failed", "Соединение прервано");
    } else if (state === "disconnected") {
      if (store.session.status !== "ended") {
        store.setStatus("connecting");
      }
    } else if (state === "closed") {
      if (store.session.status !== "ended") {
        finishCall("closed");
      }
    }
  };

  connection.oniceconnectionstatechange = () => {
    if (connection.iceConnectionState === "failed") {
      reportFailed("ice_failed", "Соединение прервано");
    }
  };

  return connection;
};

const reportConnected = () => {
  if (connectedStateReported) return;
  if (!currentMessageRtcUid || !currentOwnerUid || !currentPeerUid) return;
  connectedStateReported = true;
  void sendCallStateUpdate({
    from_user_uid: currentOwnerUid,
    to_user_uid: currentPeerUid,
    message_rtc_uid: currentMessageRtcUid,
    state: "connected",
  });
};

const reportFailed = (reasonCode: CallReasonCode, userReason: string) => {
  const store = useCallStore.getState();
  const session = store.session;
  if (!session || session.status === "ended") return;
  if (currentMessageRtcUid && currentOwnerUid && currentPeerUid) {
    void sendCallStateUpdate({
      from_user_uid: currentOwnerUid,
      to_user_uid: currentPeerUid,
      message_rtc_uid: currentMessageRtcUid,
      state: "failed",
      reason_code: reasonCode,
    });
  }
  store.patchSession({ status: "error", endedReason: userReason });
  finishCall(reasonCode);
};

const completeCall = (typeComplete: CallTypeComplete, duration: number | null) => {
  if (completionSent) return;
  if (!currentMessageRtcUid || !currentOwnerUid || !currentPeerUid) return;
  completionSent = true;
  void sendCallCompletion({
    from_user_uid: currentOwnerUid,
    to_user_uid: currentPeerUid,
    message_rtc_uid: currentMessageRtcUid,
    type_complete: typeComplete,
    duration,
  });
};

const computeDuration = (): number | null => {
  const session = useCallStore.getState().session;
  if (!session?.connectedAt) return null;
  return Math.max(0, Math.floor((Date.now() - session.connectedAt) / 1000));
};

export const startOutgoingCall = async (opts: {
  peer: CallPeer;
  mode: CallMode;
  ownerUid: string;
  ownerName?: string;
  ownerAvatarUrl?: string | null;
}) => {
  if (currentMessageRtcUid || pc || useCallStore.getState().session) {
    console.warn("[call] already in a call");
    return;
  }
  const store = useCallStore.getState();

  store.setSession({
    messageRtcUid: null,
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
    finishCall("local_media_error");
    return;
  }

  currentOwnerUid = opts.ownerUid;
  currentPeerUid = opts.peer.uid;

  const iceServers = await resolveIceServers();
  pc = createPeerConnection(iceServers);
  localStream.getTracks().forEach((track) => pc!.addTrack(track, localStream!));

  let offer: RTCSessionDescriptionInit;
  try {
    offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
  } catch (error) {
    console.error("[call] createOffer failed", error);
    store.patchSession({ status: "error", endedReason: "Не удалось начать звонок" });
    finishCall("signaling_error");
    return;
  }

  try {
    const response = await sendOfferCall({
      to_user_uid: opts.peer.uid,
      offer_sdp: offer.sdp ?? "",
    });

    if (response.status === "ERROR" || response.error) {
      throw new Error(response.error || "offer rejected");
    }

    const messageRtcUid = response.object?.message_rtc?.uid;
    if (!messageRtcUid) {
      throw new Error("server did not return message_rtc_uid");
    }

    currentMessageRtcUid = messageRtcUid;
    useCallStore.getState().patchSession({ messageRtcUid });
    flushPendingLocalIce();
  } catch (error) {
    console.error("[call] offer_call failed", error);
    useCallStore.getState().patchSession({
      status: "error",
      endedReason: "Не удалось начать звонок",
    });
    finishCall("signaling_error");
  }
};

/**
 * Вызывается из WS-обработчика, когда пришло приглашение.
 * Показываем UI входящего звонка, но `RTCPeerConnection` создаём только
 * после принятия — чтобы не дёргать микрофон впустую.
 */
export const registerIncomingOffer = (payload: CallOfferResponse, ownerUid: string) => {
  const store = useCallStore.getState();
  const messageRtcUid = payload.message_rtc?.uid;
  if (!messageRtcUid) return;

  if (store.session || currentMessageRtcUid) {
    void sendCallCompletion({
      from_user_uid: ownerUid,
      to_user_uid: payload.from_user,
      message_rtc_uid: messageRtcUid,
      type_complete: "rejected",
    });
    return;
  }

  const fromUser = payload.message_rtc?.from_user;
  const name =
    [fromUser?.first_name, fromUser?.last_name].filter(Boolean).join(" ").trim() ||
    fromUser?.username ||
    "Входящий звонок";
  const avatarUrl = fromUser?.avatar_url ?? fromUser?.avatar ?? null;

  const peer: CallPeer = {
    uid: payload.from_user,
    name,
    avatarUrl,
  };

  pendingIncoming = {
    messageRtcUid,
    peerUid: payload.from_user,
    peer,
    mode: "audio",
    offerSdp: payload.offer_sdp,
    ownerUid,
  };

  store.setSession({
    messageRtcUid,
    kind: "peer",
    mode: "audio",
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
    void sendCallCompletion({
      from_user_uid: incoming.ownerUid,
      to_user_uid: incoming.peerUid,
      message_rtc_uid: incoming.messageRtcUid,
      type_complete: "rejected",
    });
    store.patchSession({ status: "error", endedReason: "Нет доступа к микрофону" });
    finishCall("local_media_error");
    return;
  }

  currentMessageRtcUid = incoming.messageRtcUid;
  currentOwnerUid = incoming.ownerUid;
  currentPeerUid = incoming.peerUid;

  const iceServers = await resolveIceServers();
  pc = createPeerConnection(iceServers);
  localStream.getTracks().forEach((track) => pc!.addTrack(track, localStream!));

  try {
    await pc.setRemoteDescription({ type: "offer", sdp: incoming.offerSdp });
    isRemoteDescriptionSet = true;
    await flushPendingRemoteIce();

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    pendingIncoming = null;
    store.setStatus("connecting");

    const response = await sendAnswerCall({
      from_user_uid: incoming.ownerUid,
      to_user_uid: incoming.peerUid,
      message_rtc_uid: incoming.messageRtcUid,
      answer_sdp: answer.sdp ?? "",
    });

    if (response.status === "ERROR" || response.error) {
      throw new Error(response.error || "answer rejected");
    }

    flushPendingLocalIce();
  } catch (error) {
    console.error("[call] answer_call failed", error);
    reportFailed("signaling_error", "Не удалось принять звонок");
  }
};

export const rejectIncomingCall = () => {
  const incoming = pendingIncoming;
  const store = useCallStore.getState();

  if (incoming) {
    void sendCallCompletion({
      from_user_uid: incoming.ownerUid,
      to_user_uid: incoming.peerUid,
      message_rtc_uid: incoming.messageRtcUid,
      type_complete: "rejected",
    });
    completionSent = true;
  } else if (store.session && currentMessageRtcUid && currentOwnerUid && currentPeerUid) {
    completeCall("rejected", null);
  }
  pendingIncoming = null;
  finishCall("rejected");
};

export const hangupCall = () => {
  const session = useCallStore.getState().session;
  if (!session) {
    finishCall("hangup");
    return;
  }

  const duration = computeDuration();
  let typeComplete: CallTypeComplete;
  if (session.connectedAt) {
    typeComplete = "completed";
  } else if (session.isCaller) {
    typeComplete = "unreceived";
  } else {
    typeComplete = "rejected";
  }

  completeCall(typeComplete, duration);
  finishCall("hangup");
};

export const handleRemoteAnswer = async (payload: CallAnswerResponse) => {
  if (!pc || payload.message_rtc_uid !== currentMessageRtcUid) return;
  try {
    await pc.setRemoteDescription({ type: "answer", sdp: payload.answer_sdp });
    isRemoteDescriptionSet = true;
    await flushPendingRemoteIce();
    const store = useCallStore.getState();
    if (store.session && store.session.status !== "active") {
      store.setStatus("connecting");
    }
  } catch (error) {
    console.error("[call] setRemoteDescription (answer) failed", error);
    reportFailed("signaling_error", "Ошибка сигналинга");
  }
};

export const handleRemoteIce = async (payload: CallIceCandidateResponse) => {
  if (payload.message_rtc_uid !== currentMessageRtcUid) return;
  if (currentOwnerUid && payload.uid_user_owner_candidate === currentOwnerUid) return;

  let candidateInit: RTCIceCandidateInit;
  try {
    candidateInit = JSON.parse(payload.ice_candidate) as RTCIceCandidateInit;
  } catch {
    candidateInit = { candidate: payload.ice_candidate };
  }

  if (!pc || !isRemoteDescriptionSet) {
    pendingRemoteIce.push(candidateInit);
    return;
  }

  try {
    await pc.addIceCandidate(candidateInit);
  } catch (error) {
    console.warn("[call] addIceCandidate failed", error);
  }
};

export const handleRemoteCompletion = (payload: CallCompletionResponse) => {
  const session = useCallStore.getState().session;
  const incomingUid = payload.message_rtc?.uid;
  if (!session) return;
  if (incomingUid && incomingUid !== session.messageRtcUid) return;

  completionSent = true;

  let reasonLabel: string;
  switch (payload.type_complete) {
    case "rejected":
      reasonLabel = "Звонок отклонён";
      break;
    case "unreceived":
      reasonLabel = "Нет ответа";
      break;
    case "completed":
      reasonLabel = "Звонок завершён";
      break;
    case "failed":
      reasonLabel = "Не удалось соединиться";
      break;
    default:
      reasonLabel = "Звонок завершён";
  }

  useCallStore.getState().patchSession({ status: "ended", endedReason: reasonLabel });
  finishCall(payload.type_complete);
};

export const handleRemoteStateUpdate = (payload: CallStateUpdateResponse) => {
  const session = useCallStore.getState().session;
  if (!session || payload.message_rtc_uid !== session.messageRtcUid) return;

  if (payload.state === "connecting") {
    if (session.status !== "active") {
      useCallStore.getState().setStatus("connecting");
    }
  } else if (payload.state === "connected") {
    useCallStore.getState().setStatus("active");
  } else if (payload.state === "failed") {
    const reason =
      payload.reason_code === "connection_timeout"
        ? "Время соединения истекло"
        : "Не удалось соединиться";
    useCallStore.getState().patchSession({ status: "error", endedReason: reason });
    finishCall(payload.reason_code ?? "failed");
  }
};

export const setLocalMuted = (muted: boolean) => {
  if (!localStream) return;
  localStream.getAudioTracks().forEach((track) => {
    track.enabled = !muted;
  });
  useCallStore.getState().setMuted(muted);
};
