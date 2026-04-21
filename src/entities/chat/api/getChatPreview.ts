import { errorHandler } from "@/shared/api/errorHandler";
import getApiClient from "@/shared/api/getApiClient";

import { mapChatPreview } from "../model/mappers";
import { ChatPreviewDto } from "../model/types";

export const getChatPreview = async (token: string) => {
  try {
    const result = await getApiClient.get<ChatPreviewDto>(
      "/api/v1/chat/list/groups_or_channels/preview",
      { params: { token } },
    );
    return { success: true as const, data: mapChatPreview(result.data) };
  } catch (error) {
    return { success: false as const, error: errorHandler(error) };
  }
};
