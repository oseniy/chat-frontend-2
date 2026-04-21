import { getApiServer } from "@/shared/api/getApiServer";
import { Result } from "@/shared/api/types";

import { mapChatDetails, MappedChatDetails } from "../lib/mapChat";

export const getGroupChannelServer = async (
  chatKey: string,
): Promise<Result<MappedChatDetails>> => {
  try {
    const api = await getApiServer();
    const res = await api.get(`/api/v1/chat/list/groups_or_channels/${chatKey}/`);

    const mappedData = mapChatDetails(res.data);

    return { success: true, data: mappedData };
  } catch {
    return { success: false, error: "Не удалось загрузить данные чата" };
  }
};
