import getApiClient from "@/shared/api/getApiClient";

export interface ApiLinkItem {
  url: string;
  title: string | null;
  from_user: {
    first_name: string;
    last_name: string;
  };
  message_id: number;
  created_at: number;
  updated_at: number;
  forwarded_in?: unknown[];
}

interface LinksResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ApiLinkItem[];
}

export const getChatLinks = async (chatKey: string): Promise<ApiLinkItem[]> => {
  // Отрезаем префикс, как в примере с медиа
  const cleanId = chatKey.split("_").pop();

  const response = await getApiClient.get<LinksResponse>(`/api/v1/chat/message/links/${cleanId}/`);

  // Возвращаем массив результатов
  return response.data.results || [];
};
