import { WSBaseResponse } from "@/shared/api/ws/model/types";
import { sendWSRequest } from "@/shared/api/ws/wsClient";
import { WS_ACTIONS } from "@/shared/constants/constants";

type LeaveChatResponse = WSBaseResponse<{
  chat_key: string;
}>;

export const leaveChat = async (chatKey: string): Promise<LeaveChatResponse> => {
  const response = await sendWSRequest<LeaveChatResponse>(WS_ACTIONS.LEAVE_CHAT, {
    chat_key: chatKey,
  });

  if (response.status !== "OK") {
    throw new Error(response.error || "Ошибка при выходе из чата");
  }

  return response;
};
