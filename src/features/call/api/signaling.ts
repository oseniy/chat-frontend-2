import { sendWSRequest } from "@/shared/api/ws/wsClient";

import { CALL_WS_ACTIONS } from "../lib/constants";
import {
  CallAnswerPayload,
  CallEndPayload,
  CallIcePayload,
  CallOfferPayload,
} from "../model/types";

/**
 * Тонкая обёртка над `sendWSRequest`, чтобы доменная логика не знала про имена
 * экшенов. Если сервер вернёт ошибку в `status`, промис всё равно резолвится —
 * пусть бизнес-логика решает, что делать (ошибки сигналинга пока логируем).
 */
const send = async (action: string, payload: unknown): Promise<void> => {
  try {
    await sendWSRequest(action, payload);
  } catch (error) {
    console.warn(`[call] signaling "${action}" failed:`, error);
  }
};

export const sendCallOffer = (payload: CallOfferPayload) => send(CALL_WS_ACTIONS.OFFER, payload);

export const sendCallAnswer = (payload: CallAnswerPayload) => send(CALL_WS_ACTIONS.ANSWER, payload);

export const sendCallIce = (payload: CallIcePayload) => send(CALL_WS_ACTIONS.ICE, payload);

export const sendCallHangup = (payload: CallEndPayload) => send(CALL_WS_ACTIONS.HANGUP, payload);

export const sendCallReject = (payload: CallEndPayload) => send(CALL_WS_ACTIONS.REJECT, payload);

export const sendCallBusy = (payload: CallEndPayload) => send(CALL_WS_ACTIONS.BUSY, payload);
