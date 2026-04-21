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

export type CallSession = {
  callId: string;
  kind: CallKind;
  mode: CallMode;
  peer: CallPeer;
  isCaller: boolean;
  status: CallStatus;
  startedAt: number | null;
  connectedAt: number | null;
  endedReason?: string;
};

export type SdpPayload = {
  type: RTCSdpType;
  sdp: string;
};

export type CallOfferPayload = {
  call_id: string;
  from_uid: string;
  to_uid: string;
  mode: CallMode;
  kind: CallKind;
  sdp: SdpPayload;
  from_name?: string;
  from_avatar_url?: string | null;
};

export type CallAnswerPayload = {
  call_id: string;
  from_uid: string;
  to_uid: string;
  sdp: SdpPayload;
};

export type CallIcePayload = {
  call_id: string;
  from_uid: string;
  to_uid: string;
  candidate: RTCIceCandidateInit;
};

export type CallEndPayload = {
  call_id: string;
  from_uid: string;
  to_uid: string;
  reason?: string;
};
