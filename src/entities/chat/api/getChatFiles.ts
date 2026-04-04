import { MappedMessageFile } from "@/features/chat/chat/model/types/mappedTypes";
import getApiClient from "@/shared/api/getApiClient";

interface MediaResponse {
  results: Record<string, unknown>[];
}

export const getChatFiles = async (chatKey: string): Promise<MappedMessageFile[]> => {
  const cleanId = chatKey.split("_").pop();
  const response = await getApiClient.get<MediaResponse>(`/api/v1/chat/message/files/${cleanId}/`);

  const rawFiles = response.data.results || [];

  return rawFiles
    .filter((file) => {
      const type = (file.file_type || "") as string;
      return type && !type.startsWith("image/");
    })
    .map((file) => {
      const url = (file.file_url || "") as string;

      // 1. Извлекаем имя из URL
      const rawFileName = url.split("/").pop() || "Файл";
      // 2. Декодируем кириллицу
      const decodedName = decodeURIComponent(rawFileName);

      return {
        id: Number(file.id || 0),
        uid: String(file.uid),
        fileUrl: url,
        fileType: (file.file_type || "application/octet-stream") as string,
        name: decodedName,
        size: Number(file.size || 0),
        createdAt: file.created_at ? new Date(file.created_at as string).getTime() : Date.now(),
        updatedAt: file.updated_at ? new Date(file.updated_at as string).getTime() : Date.now(),
        fileWebp: null,
        fileWebpUrl: (file.file_webp_url || undefined) as string | undefined,
      };
    }) as unknown as MappedMessageFile[];
};
