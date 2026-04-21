import { getApiServer } from "@/shared/api/getApiServer";
import { Result } from "@/shared/api/types";

import { mapChatPreview } from "../model/mappers";
import { ChatPreview, ChatPreviewDto } from "../model/types";

export const getChatPreviewServer = async (token: string): Promise<Result<ChatPreview>> => {
  try {
    const api = await getApiServer();
    const res = await api.get<ChatPreviewDto>("/api/v1/chat/list/groups_or_channels/preview", {
      params: { token },
    });

    const mappedData = mapChatPreview(res.data);

    return { success: true, data: mappedData };
  } catch {
    return { success: false, error: "Не удалось загрузить превью чата" };
  }
};
