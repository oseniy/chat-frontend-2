/**
 * Имена WS-экшенов сигналинга для WebRTC-звонков.
 * Держим в одном месте: когда появится официальная API-спека,
 * достаточно будет поменять значения здесь.
 */
export const CALL_WS_ACTIONS = {
  OFFER: "rtc_call_offer",
  ANSWER: "rtc_call_answer",
  ICE: "rtc_ice_candidate",
  HANGUP: "rtc_call_hangup",
  REJECT: "rtc_call_reject",
  BUSY: "rtc_call_busy",
} as const;

export const CALL_ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

export const CALL_AUDIO_CONSTRAINTS: MediaTrackConstraints = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
};
