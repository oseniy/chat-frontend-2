import { errorHandler } from "@/shared/api/errorHandler";
import { getApiClient } from "@/shared/api/getApiClient";
import { Result } from "@/shared/api/types";

export interface ClearChatData {
  index: number | null;
}

export interface ClearChatSuccess {
  index: number | null;
}

export const clearChatForMe = async (data: ClearChatData): Promise<Result<ClearChatSuccess>> => {
  try {
    const { data: response } = await getApiClient.post<ClearChatSuccess>(
      `/api/v1/chat/list/clear/${data.index}/`,
    );

    return { success: true, data: response };
  } catch (error) {
    return { success: false, error: errorHandler(error) };
  }
};
