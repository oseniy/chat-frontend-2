import { WSBaseResponse } from "@/shared/api/ws/model/types";
import { sendWSRequest } from "@/shared/api/ws/wsClient";

import { CALL_WS_ACTIONS } from "../lib/constants";
import {
  CallAnswerResponse,
  CallCompletionResponse,
  CallOfferResponse,
  CallReasonCode,
  CallStateUpdateResponse,
  CallTypeComplete,
} from "../model/types";

export type OfferCallRequest = {
  to_user_uid: string;
  offer_sdp: string;
};

export type AnswerCallRequest = {
  from_user_uid: string;
  to_user_uid: string;
  message_rtc_uid: string;
  answer_sdp: string;
};

export type IceCandidateRequest = {
  from_user_uid: string;
  to_user_uid: string;
  message_rtc_uid: string;
  ice_candidate: string;
};

export type CallCompletionRequest = {
  from_user_uid: string;
  to_user_uid: string;
  message_rtc_uid: string;
  type_complete: CallTypeComplete;
  duration?: number | null;
};

export type CallStateUpdateRequest = {
  from_user_uid: string;
  to_user_uid: string;
  message_rtc_uid: string;
  state: "connected" | "failed";
  reason_code?: CallReasonCode | null;
};

export const sendOfferCall = (
  payload: OfferCallRequest,
): Promise<WSBaseResponse<CallOfferResponse>> =>
  sendWSRequest<WSBaseResponse<CallOfferResponse>>(CALL_WS_ACTIONS.OFFER, payload);

export const sendAnswerCall = (
  payload: AnswerCallRequest,
): Promise<WSBaseResponse<CallAnswerResponse>> => {
  console.log("payload from sendAnswerCall: ", payload);

  return sendWSRequest<WSBaseResponse<CallAnswerResponse>>(CALL_WS_ACTIONS.ANSWER, payload);
};

export const sendIceCandidate = async (payload: IceCandidateRequest): Promise<void> => {
  try {
    await sendWSRequest<WSBaseResponse<unknown>>(CALL_WS_ACTIONS.ICE, payload);
  } catch (error) {
    console.warn("[call] ice_candidate send failed", error);
  }
};

export const sendCallCompletion = async (
  payload: CallCompletionRequest,
): Promise<WSBaseResponse<CallCompletionResponse> | null> => {
  try {
    return await sendWSRequest<WSBaseResponse<CallCompletionResponse>>(
      CALL_WS_ACTIONS.COMPLETION,
      payload,
    );
  } catch (error) {
    console.warn("[call] call_completion send failed", error);
    return null;
  }
};

export const sendCallStateUpdate = async (
  payload: CallStateUpdateRequest,
): Promise<WSBaseResponse<CallStateUpdateResponse> | null> => {
  try {
    return await sendWSRequest<WSBaseResponse<CallStateUpdateResponse>>(
      CALL_WS_ACTIONS.STATE_UPDATE,
      payload,
    );
  } catch (error) {
    console.warn("[call] call_state_update send failed", error);
    return null;
  }
};
