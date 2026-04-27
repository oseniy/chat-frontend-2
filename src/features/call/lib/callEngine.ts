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
let connectTimeoutId: ReturnType<typeof setTimeout> | null = null;
let statsDumpTimeoutId: ReturnType<typeof setTimeout> | null = null;

const pendingLocalIce: string[] = [];
const pendingRemoteIce: RTCIceCandidateInit[] = [];

const localCandidateSummary = { host: 0, srflx: 0, prflx: 0, relay: 0, other: 0 };
const remoteCandidateSummary = { host: 0, srflx: 0, prflx: 0, relay: 0, other: 0 };

const LOG = "[call]";

const bumpSummary = (summary: typeof localCandidateSummary, type: string) => {
  if (type === "host" || type === "srflx" || type === "prflx" || type === "relay") {
    summary[type] += 1;
  } else {
    summary.other += 1;
  }
};

const dumpStats = async (label: string) => {
  if (!pc) return;
  try {
    const stats = await pc.getStats();
    const candidates = new Map<string, RTCIceCandidatePairStats | RTCIceCandidate | unknown>();
    let selectedPairId: string | null = null;
    let nominatedPair: RTCIceCandidatePairStats | null = null;

    stats.forEach((report) => {
      if (
        report.type === "transport" &&
        (report as { selectedCandidatePairId?: string }).selectedCandidatePairId
      ) {
        selectedPairId =
          (report as { selectedCandidatePairId?: string }).selectedCandidatePairId ?? null;
      }
    });

    stats.forEach((report) => {
      if (report.type === "local-candidate" || report.type === "remote-candidate") {
        candidates.set(report.id, report);
      }
      if (report.type === "candidate-pair") {
        const pair = report as RTCIceCandidatePairStats & {
          nominated?: boolean;
          selected?: boolean;
        };
        if (pair.nominated || pair.selected || pair.id === selectedPairId) {
          nominatedPair = pair;
        }
      }
    });

    if (nominatedPair) {
      const pair = nominatedPair as RTCIceCandidatePairStats & {
        localCandidateId: string;
        remoteCandidateId: string;
      };
      const local = candidates.get(pair.localCandidateId) as
        | (RTCIceCandidate & { candidateType?: string; protocol?: string; relayProtocol?: string })
        | undefined;
      const remote = candidates.get(pair.remoteCandidateId) as
        | (RTCIceCandidate & { candidateType?: string; protocol?: string })
        | undefined;
      console.log(`${LOG} stats[${label}] selected pair`, {
        state: pair.state,
        local: local && {
          type: local.candidateType,
          protocol: local.protocol,
          relayProtocol: local.relayProtocol,
        },
        remote: remote && {
          type: remote.candidateType,
          protocol: remote.protocol,
        },
      });
    } else {
      console.warn(`${LOG} stats[${label}] no selected/nominated pair yet`);
      const pairs: unknown[] = [];
      stats.forEach((report) => {
        if (report.type === "candidate-pair") pairs.push(report);
      });
      console.warn(`${LOG} stats[${label}] candidate pairs (${pairs.length})`, pairs);
    }
  } catch (error) {
    console.warn(`${LOG} dumpStats failed`, error);
  }
};

const clearConnectTimeout = () => {
  if (connectTimeoutId !== null) {
    clearTimeout(connectTimeoutId);
    connectTimeoutId = null;
  }
  if (statsDumpTimeoutId !== null) {
    clearTimeout(statsDumpTimeoutId);
    statsDumpTimeoutId = null;
  }
};

const armConnectTimeout = () => {
  clearConnectTimeout();
  // Если за 8 сек ICE не нашёл пары — снимаем стейт-снимок (без обрыва).
  statsDumpTimeoutId = setTimeout(() => {
    void dumpStats("8s-checkpoint");
  }, 8000);
  // Жёсткий таймаут на установление соединения — иначе залипает в "connecting" навсегда.
  connectTimeoutId = setTimeout(() => {
    if (connectedStateReported) return;
    console.error(`${LOG} connect timeout — ICE never reached connected state`, {
      iceConnectionState: pc?.iceConnectionState,
      connectionState: pc?.connectionState,
      iceGatheringState: pc?.iceGatheringState,
      signalingState: pc?.signalingState,
      localCandidateSummary,
      remoteCandidateSummary,
    });
    void dumpStats("timeout");
    reportFailed("connection_timeout", "Не удалось соединиться");
  }, 30000);
};

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
  console.log(`${LOG} cleanup`, {
    localCandidateSummary: { ...localCandidateSummary },
    remoteCandidateSummary: { ...remoteCandidateSummary },
  });

  clearConnectTimeout();
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
  Object.keys(localCandidateSummary).forEach((k) => {
    localCandidateSummary[k as keyof typeof localCandidateSummary] = 0;
  });
  Object.keys(remoteCandidateSummary).forEach((k) => {
    remoteCandidateSummary[k as keyof typeof remoteCandidateSummary] = 0;
  });
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

const summariseIceServers = (servers: RTCIceServer[]) =>
  servers.map((s) => {
    const urls = Array.isArray(s.urls) ? s.urls : [s.urls];
    return {
      urls,
      hasUsername: Boolean(s.username),
      hasCredential: Boolean(s.credential),
    };
  });

const resolveIceServers = async (): Promise<RTCIceServer[]> => {
  const result = await getIceServers();
  if (result.success && result.data.length > 0) {
    const hasTurn = result.data.some((s) => {
      const urls = Array.isArray(s.urls) ? s.urls : [s.urls];
      return urls.some((u) => u.startsWith("turn:") || u.startsWith("turns:"));
    });
    console.log(`${LOG} ICE servers resolved`, {
      count: result.data.length,
      hasTurn,
      servers: summariseIceServers(result.data),
    });
    if (!hasTurn) {
      console.warn(
        `${LOG} no TURN servers in config — peers behind symmetric NAT will not connect`,
      );
    }
    return result.data;
  }
  console.warn(`${LOG} falling back to default STUN-only ICE servers`, {
    success: result.success,
    error: result.success ? null : result.error,
  });
  return CALL_DEFAULT_ICE_SERVERS;
};

// Бэк ждёт у ICE-сообщений ту же конвенцию направления, что и у answer_call:
// from_user_uid = инициатор звонка, to_user_uid = принимающий — независимо от того,
// кто из двух сторон отправляет это конкретное сообщение. Если callee шлёт ICE
// в формате "отправитель→получатель" (from=я, to=другой), бэк не маршрутизирует
// его инициатору, и у того никогда не появятся remote-кандидаты.
const buildIceRouting = (): { from_user_uid: string; to_user_uid: string } | null => {
  if (!currentOwnerUid || !currentPeerUid) return null;
  const isCaller = useCallStore.getState().session?.isCaller ?? false;
  return isCaller
    ? { from_user_uid: currentOwnerUid, to_user_uid: currentPeerUid }
    : { from_user_uid: currentPeerUid, to_user_uid: currentOwnerUid };
};

const flushPendingLocalIce = () => {
  if (!currentMessageRtcUid) return;
  const routing = buildIceRouting();
  if (!routing) return;
  const messageRtcUid = currentMessageRtcUid;
  while (pendingLocalIce.length > 0) {
    const ice_candidate = pendingLocalIce.shift();
    if (!ice_candidate) continue;
    void sendIceCandidate({
      ...routing,
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
  if (!currentMessageRtcUid) return;
  const routing = buildIceRouting();
  if (!routing) return;
  const connection = new RTCPeerConnection({
    iceServers,
    // max-bundle и одна транспортная сессия → меньше пар для проверки,
    // быстрее и стабильнее ICE на мобильных сетях.
    bundlePolicy: "max-bundle",
    rtcpMuxPolicy: "require",
    // Префетчим ICE-кандидаты, чтобы к моменту setLocalDescription они уже были.
    iceCandidatePoolSize: 4,
  });
  console.log(`${LOG} RTCPeerConnection created`, {
    iceServersCount: iceServers.length,
  });

  connection.onicecandidate = (event) => {
    if (!event.candidate) {
      console.log(`${LOG} ICE gathering finished`, {
        local: { ...localCandidateSummary },
      });
      return;
    }
    const cand = event.candidate;
    bumpSummary(localCandidateSummary, cand.type ?? "other");
    console.log(`${LOG} local ICE candidate`, {
      type: cand.type,
      protocol: cand.protocol,
      relayProtocol: (cand as RTCIceCandidate & { relayProtocol?: string }).relayProtocol,
      address: cand.address ?? cand.candidate?.split(" ")[4],
      port: cand.port,
      tcpType: cand.tcpType,
      raw: cand.candidate,
    });
    const ice_candidate = JSON.stringify(cand.toJSON());
    if (!currentMessageRtcUid || !currentOwnerUid || !currentPeerUid) {
      pendingLocalIce.push(ice_candidate);
      return;
    }
    void sendIceCandidate({
      ...routing,
      message_rtc_uid: currentMessageRtcUid,
      ice_candidate,
    });
  };

  connection.onicecandidateerror = (event) => {
    const e = event as RTCPeerConnectionIceErrorEvent;
    // 701 = STUN/TURN не отвечает; 401/403 — bad creds; 300+ — server error
    console.warn(`${LOG} ICE candidate error`, {
      url: e.url,
      address: e.address,
      port: e.port,
      errorCode: e.errorCode,
      errorText: e.errorText,
    });
  };

  connection.onicegatheringstatechange = () => {
    console.log(`${LOG} iceGatheringState → ${connection.iceGatheringState}`);
  };

  connection.onsignalingstatechange = () => {
    console.log(`${LOG} signalingState → ${connection.signalingState}`);
  };

  connection.ontrack = (event) => {
    console.log(`${LOG} ontrack`, {
      kind: event.track.kind,
      streamCount: event.streams.length,
    });
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
    console.log(`${LOG} connectionState → ${state}`);
    const store = useCallStore.getState();
    if (!store.session) return;

    if (state === "connected") {
      store.setStatus("active");
      reportConnected();
      clearConnectTimeout();
      void dumpStats("connected");
    } else if (state === "failed") {
      void dumpStats("failed");
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
    const state = connection.iceConnectionState;
    console.log(`${LOG} iceConnectionState → ${state}`);
    if (state === "failed") {
      void dumpStats("ice-failed");
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
  pc = createPeerConnection(iceServers) ?? null;
  localStream.getTracks().forEach((track) => pc!.addTrack(track, localStream!));

  let offer: RTCSessionDescriptionInit;
  if (!pc) return;
  try {
    offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    armConnectTimeout();
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
  console.log("registerIncomingOffer");

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

  // Инициализируем идентификаторы маршрутизации сразу, иначе handleRemoteIce
  // будет отбрасывать ICE-кандидаты инициатора по проверке message_rtc_uid,
  // и к моменту accept у нас не будет ни одного remote-кандидата → ICE
  // не найдёт пары и соединение провалится.
  currentMessageRtcUid = messageRtcUid;
  currentOwnerUid = ownerUid;
  currentPeerUid = payload.from_user;

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
  console.log("acceptIncomingCall");
  const incoming = pendingIncoming;
  console.log("incoming: ", incoming);
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
    armConnectTimeout();

    pendingIncoming = null;
    store.setStatus("connecting");
    const response = await sendAnswerCall({
      from_user_uid: incoming.peerUid,
      to_user_uid: incoming.ownerUid,
      message_rtc_uid: incoming.messageRtcUid,
      answer_sdp: answer.sdp ?? "",
    });
    if (response.status === "ERROR" || response.error) {
      console.log("log from if block");
      console.log("error: ", response.error);

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
  // Answer имеет смысл применять только когда мы уже отправили offer
  // и ждём удалённый answer. В любом другом состоянии (stable, have-remote-offer,
  // closed и т.д.) setRemoteDescription({type:"answer"}) завершится ошибкой.
  if (pc.signalingState !== "have-local-offer") return;
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
  if (payload.message_rtc_uid !== currentMessageRtcUid) {
    console.warn(`${LOG} drop remote ICE — message_rtc_uid mismatch`, {
      got: payload.message_rtc_uid,
      expected: currentMessageRtcUid,
    });
    return;
  }
  if (currentOwnerUid && payload.uid_user_owner_candidate === currentOwnerUid) return;

  let candidateInit: RTCIceCandidateInit;
  try {
    candidateInit = JSON.parse(payload.ice_candidate) as RTCIceCandidateInit;
  } catch {
    candidateInit = { candidate: payload.ice_candidate };
  }

  // Парсим тип кандидата из строки candidate:... typ <type>
  const raw = candidateInit.candidate ?? "";
  const typMatch = raw.match(/ typ (\S+)/);
  const protoMatch = raw.match(/^candidate:\S+ \d+ (\S+)/);
  const candType = typMatch ? typMatch[1] : "unknown";
  bumpSummary(remoteCandidateSummary, candType);
  console.log(`${LOG} remote ICE candidate`, {
    type: candType,
    protocol: protoMatch ? protoMatch[1] : "?",
    queued: !pc || !isRemoteDescriptionSet,
    raw,
  });

  if (!pc || !isRemoteDescriptionSet) {
    pendingRemoteIce.push(candidateInit);
    return;
  }

  try {
    await pc.addIceCandidate(candidateInit);
  } catch (error) {
    console.warn(`${LOG} addIceCandidate failed`, error, candidateInit);
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
