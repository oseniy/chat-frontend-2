import { sendWSRequest } from "@/shared/api/ws/wsClient";
import { WS_ACTIONS } from "@/shared/constants/constants";

type ClearChatForAllResponse = {
  chat_key: string;
};

export const clearChatForAll = async (chatKey: string) => {
  try {
    await sendWSRequest<ClearChatForAllResponse>(WS_ACTIONS.CLEAR_GROUP_MESSAGES, {
      chat_key: chatKey,
      confirm: true,
    });
  } catch (error) {
    console.error("Ошибка отправки (или очередь полна):", error);
  }
};
