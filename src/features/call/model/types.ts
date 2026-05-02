export type CallMode = "audio" | "video";

export type CallKind = "peer" | "group";

export type CallStatus =
  | "idle"
  | "outgoing"
  | "incoming"
  | "connecting"
  | "active"
  | "ended"
  | "error";

export type CallPeer = {
  uid: string;
  name: string;
  avatarUrl?: string | null;
};

export type CallReasonCode =
  | "connection_timeout"
  | "ice_failed"
  | "peer_connection_failed"
  | "local_media_error"
  | "signaling_error"
  | "unknown_error";

export type CallTypeComplete = "unreceived" | "rejected" | "completed";

export type CallSession = {
  messageRtcUid: string | null;
  kind: CallKind;
  mode: CallMode;
  peer: CallPeer;
  isCaller: boolean;
  status: CallStatus;
  startedAt: number | null;
  connectedAt: number | null;
  endedReason?: string;
};

export type CallUserShort = {
  uid: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  avatar?: string;
  avatar_url?: string;
  avatar_master_url?: string;
};

export type MessageRTC = {
  uid: string;
  from_user?: CallUserShort;
  to_user?: CallUserShort;
  duration?: number | null;
  status?: string;
  answered_at?: string | null;
  connected_at?: string | null;
  reason_code?: string;
  updated_at?: string;
  created_at?: string;
};

export type CallOfferResponse = {
  from_user: string;
  to_user: string;
  offer_sdp: string;
  message_rtc: MessageRTC;
  message_uid?: string | null;
};

export type CallAnswerResponse = {
  from_user: string;
  to_user: string;
  answer_sdp: string;
  message_rtc_uid: string;
  call_state: "answered" | "connecting" | "connected" | "failed";
};

export type CallIceCandidateResponse = {
  from_user: string;
  to_user: string;
  message_rtc_uid: string;
  uid_user_owner_candidate: string;
  ice_candidate: string;
};

export type CallCompletionResponse = {
  from_user: string;
  to_user: string;
  type_complete: string;
  message_rtc: MessageRTC;
  message_uid?: string | null;
};

export type CallStateUpdateResponse = {
  from_user: string;
  to_user: string;
  message_rtc_uid: string;
  state: "connecting" | "connected" | "failed";
  reason_code?: CallReasonCode | null;
  message_rtc?: MessageRTC;
};
