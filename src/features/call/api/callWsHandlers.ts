import { useUserStore } from "@/entities/user/model/userStore";
import { WSHandler } from "@/shared/api/ws/model/types";
import { registerWSHandler } from "@/shared/api/ws/wsHandlers";

import {
  handleRemoteAnswer,
  handleRemoteCompletion,
  handleRemoteIce,
  handleRemoteStateUpdate,
  registerIncomingOffer,
} from "../lib/callEngine";
import { CALL_WS_ACTIONS } from "../lib/constants";
import {
  CallAnswerResponse,
  CallCompletionResponse,
  CallIceCandidateResponse,
  CallOfferResponse,
  CallStateUpdateResponse,
} from "../model/types";

const onOffer: WSHandler<CallOfferResponse> = (data) => {
  if (!data.object) return;
  const ownerUid = useUserStore.getState().userId;
  if (!ownerUid) return;
  if (data.object.from_user === ownerUid) return;
  registerIncomingOffer(data.object, ownerUid);
};

const onAnswer: WSHandler<CallAnswerResponse> = (data) => {
  if (!data.object) return;
  const ownerUid = useUserStore.getState().userId;
  if (ownerUid && data.object.from_user === ownerUid) return;
  void handleRemoteAnswer(data.object);
};

const onIce: WSHandler<CallIceCandidateResponse> = (data) => {
  if (!data.object) return;
  const ownerUid = useUserStore.getState().userId;
  if (ownerUid && data.object.uid_user_owner_candidate === ownerUid) return;
  void handleRemoteIce(data.object);
};

const onCompletion: WSHandler<CallCompletionResponse> = (data) => {
  if (!data.object) return;
  handleRemoteCompletion(data.object);
};

const onStateUpdate: WSHandler<CallStateUpdateResponse> = (data) => {
  if (!data.object) return;
  handleRemoteStateUpdate(data.object);
};

export const bootstrapCallWSHandlers = () => {
  registerWSHandler(CALL_WS_ACTIONS.OFFER, onOffer as WSHandler);
  registerWSHandler(CALL_WS_ACTIONS.ANSWER, onAnswer as WSHandler);
  registerWSHandler(CALL_WS_ACTIONS.ICE, onIce as WSHandler);
  registerWSHandler(CALL_WS_ACTIONS.COMPLETION, onCompletion as WSHandler);
  registerWSHandler(CALL_WS_ACTIONS.STATE_UPDATE, onStateUpdate as WSHandler);
};
