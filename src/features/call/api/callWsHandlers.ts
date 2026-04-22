import { useUserStore } from "@/entities/user/model/userStore";
import { WSHandler } from "@/shared/api/ws/model/types";

import {
  handleRemoteAnswer,
  handleRemoteCompletion,
  handleRemoteIce,
  handleRemoteStateUpdate,
  registerIncomingOffer,
} from "../lib/callEngine";
import { useCallStore } from "../model/callStore";
import {
  CallAnswerResponse,
  CallCompletionResponse,
  CallIceCandidateResponse,
  CallOfferResponse,
  CallStateUpdateResponse,
} from "../model/types";

export const onOffer: WSHandler<CallOfferResponse> = (data) => {
  if (!data.object) return;
  const ownerUid = useUserStore.getState().userId;
  if (!ownerUid) return;
  if (data.object.from_user === ownerUid) return;
  registerIncomingOffer(data.object, ownerUid);
};

export const onAnswer: WSHandler<CallAnswerResponse> = (data) => {
  if (!data.object) return;
  // В answer_call поля from_user/to_user описывают НАПРАВЛЕНИЕ звонка
  // (from_user = инициатор, to_user = принимающий), а не отправителя этого
  // сообщения. Поэтому фильтровать эхо через `from_user === me` нельзя —
  // оно прилетает обратно и принимающему, и инициатору с одними и теми же
  // значениями. Answer имеет смысл применять только инициатору звонка.
  const session = useCallStore.getState().session;
  if (!session || !session.isCaller) return;
  void handleRemoteAnswer(data.object);
};

export const onIce: WSHandler<CallIceCandidateResponse> = (data) => {
  if (!data.object) return;
  const ownerUid = useUserStore.getState().userId;
  if (ownerUid && data.object.uid_user_owner_candidate === ownerUid) return;
  void handleRemoteIce(data.object);
};

export const onCompletion: WSHandler<CallCompletionResponse> = (data) => {
  if (!data.object) return;
  handleRemoteCompletion(data.object);
};

export const onStateUpdate: WSHandler<CallStateUpdateResponse> = (data) => {
  if (!data.object) return;
  handleRemoteStateUpdate(data.object);
};
