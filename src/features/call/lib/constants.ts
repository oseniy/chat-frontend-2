export const CALL_WS_ACTIONS = {
  OFFER: "offer_call",
  ANSWER: "answer_call",
  ICE: "ice_candidate",
  COMPLETION: "call_completion",
  STATE_UPDATE: "call_state_update",
  NEW_CALL_MESSAGE: "new_call_message",
} as const;

export const CALL_DEFAULT_ICE_SERVERS: RTCIceServer[] = [{ urls: "stun:turn-server.ktsf.ru:3478" }];

export const CALL_AUDIO_CONSTRAINTS: MediaTrackConstraints = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
};
