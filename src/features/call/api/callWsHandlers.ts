import { useUserStore } from "@/entities/user/model/userStore";
import { WSHandler } from "@/shared/api/ws/model/types";
import { registerWSHandler } from "@/shared/api/ws/wsHandlers";

import {
  handleRemoteAnswer,
  handleRemoteBusy,
  handleRemoteHangup,
  handleRemoteIce,
  handleRemoteReject,
  registerIncomingOffer,
} from "../lib/callEngine";
import { CALL_WS_ACTIONS } from "../lib/constants";
import {
  CallAnswerPayload,
  CallEndPayload,
  CallIcePayload,
  CallOfferPayload,
} from "../model/types";

const onOffer: WSHandler<CallOfferPayload> = (data) => {
  if (!data.object) return;
  const ownerUid = useUserStore.getState().userId;
  if (!ownerUid) return;
  registerIncomingOffer(data.object, ownerUid);
};

const onAnswer: WSHandler<CallAnswerPayload> = (data) => {
  if (!data.object) return;
  void handleRemoteAnswer(data.object);
};

const onIce: WSHandler<CallIcePayload> = (data) => {
  if (!data.object) return;
  void handleRemoteIce(data.object);
};

const onHangup: WSHandler<CallEndPayload> = (data) => {
  if (!data.object) return;
  handleRemoteHangup(data.object);
};

const onReject: WSHandler<CallEndPayload> = (data) => {
  if (!data.object) return;
  handleRemoteReject(data.object);
};

const onBusy: WSHandler<CallEndPayload> = (data) => {
  if (!data.object) return;
  handleRemoteBusy(data.object);
};

export const bootstrapCallWSHandlers = () => {
  registerWSHandler(CALL_WS_ACTIONS.OFFER, onOffer as WSHandler);
  registerWSHandler(CALL_WS_ACTIONS.ANSWER, onAnswer as WSHandler);
  registerWSHandler(CALL_WS_ACTIONS.ICE, onIce as WSHandler);
  registerWSHandler(CALL_WS_ACTIONS.HANGUP, onHangup as WSHandler);
  registerWSHandler(CALL_WS_ACTIONS.REJECT, onReject as WSHandler);
  registerWSHandler(CALL_WS_ACTIONS.BUSY, onBusy as WSHandler);
};
