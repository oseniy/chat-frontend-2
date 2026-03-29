import { WSBaseResponse } from "@/shared/api/ws/model/types";
import { sendWSRequest } from "@/shared/api/ws/wsClient";
import { WS_ACTIONS } from "@/shared/constants/constants";

type NewOwner = {
  uid: string;
  full_name: string;
};

export type MakeAdminResponse = WSBaseResponse<{
  chat_key: string;
  chat_type: string;
  new_owner: NewOwner;
}>;

export const makeAdmin = async (chatKey: string, uid: string): Promise<MakeAdminResponse> => {
  const response = await sendWSRequest<MakeAdminResponse>(WS_ACTIONS.TRANSFER_OWNER, {
    chat_key: chatKey,
    new_owner_uid: uid,
  });

  if (response.status !== "OK") {
    throw new Error(response.error || "Ошибка при передаче прав владельца");
  }

  return response;
};
