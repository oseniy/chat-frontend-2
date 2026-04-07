import { errorHandler } from "@/shared/api/errorHandler";
import { getApiClient } from "@/shared/api/getApiClient";
import { Result } from "@/shared/api/types";

export interface SetChatListData {
  is_favorite?: boolean;
  notifications?: boolean;
  index: number;
  last_seen_message?: number;
}

export interface SetChatListSuccess {
  is_favorite: boolean;
  notifications: boolean;
  last_seen_message: number;
  last_seen_message_uid: string;
}

export const setChatList = async (data: SetChatListData): Promise<Result<SetChatListSuccess>> => {
  try {
    const { data: response } = await getApiClient.post<SetChatListSuccess>(
      `/api/v1/chat/list/${data.index}/`,
      data,
    );

    return { success: true, data: response };
  } catch (error) {
    return { success: false, error: errorHandler(error) };
  }
};
