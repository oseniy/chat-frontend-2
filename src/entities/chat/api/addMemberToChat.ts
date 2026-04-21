import { v4 as uuidv4 } from "uuid";

import { sendWSRequest } from "@/shared/api/ws/wsClient";
import { WS_ACTIONS } from "@/shared/constants/constants";

export interface AddMembersToChatPayload {
  chat_key: string;
  uid_users_list: string[];
}

export interface AddMembersToChatResponse {
  chat_key: string;
  chat_type: string;
  added_users: {
    uid: string;
    full_name: string;
  }[];
}

export const addMembersToChat = async (
  payload: AddMembersToChatPayload,
): Promise<AddMembersToChatResponse> => {
  const requestUid = uuidv4();

  const wsPayload = {
    action: WS_ACTIONS.ADD_MEMBERS_TO_CHAT,
    request_uid: requestUid,
    object: {
      chat_key: payload.chat_key,
      uid_users_list: payload.uid_users_list,
    },
  };
  const response = await sendWSRequest<{
    request_uid: string;
    status: "OK" | "error";
    error?: string;
    object: AddMembersToChatResponse;
  }>(WS_ACTIONS.ADD_MEMBERS_TO_CHAT, wsPayload.object);

  if (response.status !== "OK") {
    throw new Error(response.error || "Ошибка добавления участников");
  }

  return response.object;
};
