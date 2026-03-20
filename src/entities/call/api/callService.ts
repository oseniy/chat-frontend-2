import { v4 as uuidv4 } from "uuid";

import { sendWSRequest } from "@/shared/api/ws/wsClient";

interface CallPayload {
  from_user?: string;
  to_user?: string;
  from_user_uid?: string;
  to_user_uid?: string;
  offer_sdp?: string;
  answer_sdp?: string;
  ice_candidate?: string;
  message_rtc_uid?: string;
  message_rtc?: { uid: string } | null;
  type_complete?: string;
  uid_user_owner_candidate?: string;
  [key: string]: unknown;
}

export const callService = {
  sendSignal: (
    action: string,
    fromId: string,
    toId: string,
    rtcUid: string,
    extraData: Record<string, unknown> = {},
    _customRequestUid?: string,
  ): void => {
    let objectPayload: CallPayload = {};

    switch (action) {
      case "offer_call":
        objectPayload = {
          to_user: toId,
          to_user_uid: toId,
          offer_sdp: typeof extraData.offer_sdp === "string" ? extraData.offer_sdp : undefined,
        };
        break;

      case "answer_call":
        objectPayload = {
          from_user: fromId,
          to_user: toId,
          from_user_uid: fromId,
          to_user_uid: toId,
          answer_sdp: typeof extraData.answer_sdp === "string" ? extraData.answer_sdp : undefined,
          message_rtc: rtcUid ? { uid: rtcUid } : null,
          message_rtc_uid: rtcUid,
        };
        break;

      case "ice_candidate":
        objectPayload = {
          from_user: fromId,
          to_user: toId,
          from_user_uid: fromId,
          to_user_uid: toId,
          ice_candidate:
            typeof extraData.ice_candidate === "string" ? extraData.ice_candidate : undefined,
          message_rtc: rtcUid ? { uid: rtcUid } : null,
          message_rtc_uid: rtcUid,
        };
        if (typeof extraData.uid_user_owner_candidate === "string") {
          objectPayload.uid_user_owner_candidate = extraData.uid_user_owner_candidate;
        }
        break;

      case "call_completion":
        objectPayload = {
          from_user: fromId,
          to_user: toId,
          from_user_uid: fromId,
          to_user_uid: toId,
          message_rtc: rtcUid ? { uid: rtcUid } : null,
          message_rtc_uid: rtcUid,
          type_complete:
            typeof extraData.type_complete === "string" ? extraData.type_complete : "success",
        };
        break;

      default:
        objectPayload = {
          from_user: fromId,
          to_user: toId,
          from_user_uid: fromId,
          to_user_uid: toId,
          ...extraData,
        };
        if (rtcUid) {
          objectPayload.message_rtc = { uid: rtcUid };
        }
    }

    const finalRequestUid = uuidv4();
    sendWSRequest(action, objectPayload, finalRequestUid);

    console.warn(`[CALL SERVICE] ${action.toUpperCase()} отправлен. RTC_UID: ${rtcUid}`);
  },

  getIceServers: async (): Promise<RTCIceServer[]> => {
    const defaultIce = [{ urls: "stun:stun.l.google.com:19302" }];
    try {
      const response = await fetch("/api/v1/calls/config/");
      if (!response.ok) return defaultIce;
      const data = await response.json();
      return data.ice_servers || defaultIce;
    } catch {
      return defaultIce;
    }
  },
};
