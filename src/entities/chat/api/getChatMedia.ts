import { MappedMessageFile } from "@/features/chat/chat/model/types/mappedTypes";
import getApiClient from "@/shared/api/getApiClient";

// Описываем интерфейс ответа, чтобы избежать 'any'
interface MediaResponse {
  results: (MappedMessageFile & { file_url?: string; file_type?: string })[];
  count: number;
  next: string | null;
  previous: string | null;
}

export const getChatMedia = async (chatKey: string): Promise<MappedMessageFile[]> => {
  // Отрезаем префикс "group_" или "user_"
  const cleanId = chatKey.split("_").pop();

  // Указываем интерфейс MediaResponse вместо any
  const response = await getApiClient.get<MediaResponse>(`/api/v1/chat/message/files/${cleanId}/`);

  // Возвращаем массив из results. Если результатов нет, отдаем пустой массив.
  return response.data.results || [];
};
