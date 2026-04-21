/**
 * Имена WS-экшенов сигналинга для WebRTC-звонков.
 * Держим в одном месте: когда появится официальная API-спека,
 * достаточно будет поменять значения здесь.
 */
export const CALL_WS_ACTIONS = {
  OFFER: "offer_call",
  ANSWER: "answer_call",
  ICE: "ice_candidate",
  HANGUP: "rtc_call_hangup",
  REJECT: "rtc_call_reject",
  BUSY: "rtc_call_busy",
} as const;

export const CALL_ICE_SERVERS: RTCIceServer[] = [{ urls: "stun:turn-server.ktsf.ru:3478" }];

export const CALL_AUDIO_CONSTRAINTS: MediaTrackConstraints = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
};
