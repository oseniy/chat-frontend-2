import { WSBaseResponse } from "@/shared/api/ws/model/types";
import { sendWSRequest } from "@/shared/api/ws/wsClient";
import { WS_ACTIONS } from "@/shared/constants/constants";

type RemovedUser = {
  uid: string;
  full_name: string;
};

export type RemoveMembersFromChatResponse = WSBaseResponse<{
  chat_key: string;
  chat_type: string;
  remove_users: RemovedUser[];
}>;

export const removeMembersFromChat = async (
  chatKey: string,
  uids: string[],
): Promise<RemoveMembersFromChatResponse> => {
  const response = await sendWSRequest<RemoveMembersFromChatResponse>(
    WS_ACTIONS.REMOVE_MEMBERS_FROM_CHAT,
    {
      chat_key: chatKey,
      uid_users_list: uids,
    },
  );

  if (response.status !== "OK") {
    throw new Error(response.error || "Ошибка при удалении участника");
  }

  return response;
};
