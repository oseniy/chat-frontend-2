import { getApiClient } from "@/shared/api/getApiClient";

import { mapChatParticipantListResponse } from "../model/participantMapper";
import { ChatParticipantListResponse, ChatParticipantListResponseDto } from "../model/types";

export const getParticipants = async (
  chatKey: string,
  url?: string,
): Promise<ChatParticipantListResponse> => {
  let targetUrl = `/api/v1/chat/list/groups_or_channels/${chatKey}/participants/`;
  // Если URL пришел из поля "next" бэкенда
  if (url) {
    try {
      const parsed = new URL(url);
      // Превращаем "http://api.example.org/api/v1/...?page=2"
      // в "/api/v1/...?page=2"
      targetUrl = parsed.pathname + parsed.search;
    } catch {
      // Если это не URL (например, просто строка пути), используем как есть
      targetUrl = url;
    }
  }

  const { data } = await getApiClient.get<ChatParticipantListResponseDto>(targetUrl);
  return mapChatParticipantListResponse(data);
};
