import { ChatObject } from "@/entities/chat/model/types";
import { ChatType } from "@/entities/chat/model/types";
import { WSBaseResponse } from "@/shared/api/ws/model/types";
import { sendWSRequest } from "@/shared/api/ws/wsClient";

export type CreateChatArgs = {
  name: string;
  description?: string;
  chat_type: ChatType;
  uid_users_list: string[];
  avatar: {
    filename: string;
    data: string; // здесь будет чистый base64
  } | null;
};

export const createChat = (args: CreateChatArgs): Promise<WSBaseResponse<ChatObject>> => {
  return sendWSRequest<WSBaseResponse<ChatObject>>("create_chat", args);
};
