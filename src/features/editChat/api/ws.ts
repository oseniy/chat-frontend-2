import { ChatType } from "@/entities/chat/model/types";
import { WSBaseResponse } from "@/shared/api/ws/model/types";
import { sendWSRequest } from "@/shared/api/ws/wsClient";
import { WS_ACTIONS } from "@/shared/constants/constants";

export type EditChatArgs = {
  chat_key: string;
  name: string;
  description: string;
  chat_type: ChatType;
  avatar: {
    filename: string;
    data: string;
  } | null;
};

export const editChat = (args: EditChatArgs): Promise<WSBaseResponse> => {
  return sendWSRequest<WSBaseResponse>(WS_ACTIONS.EDIT_CHAT, args);
};
