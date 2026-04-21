import { WSBaseResponse } from "@/shared/api/ws/model/types";
import { sendWSRequest } from "@/shared/api/ws/wsClient";

export type JoinByInviteResponse = WSBaseResponse<{
  chat_key: string;
}>;

export const joinByInvite = async (chatKey: string, token: string) => {
  try {
    await sendWSRequest<JoinByInviteResponse>("join_by_invite_link", {
      chat_key: chatKey,
      token: token,
    });
  } catch (error) {
    console.error("Ошибка отправки (или очередь полна):", error);
  }
};
