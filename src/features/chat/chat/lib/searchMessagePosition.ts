import { errorHandler } from "@/shared/api/errorHandler";
import getApiClient from "@/shared/api/getApiClient";
import { Result } from "@/shared/api/types";

export interface SearchMessageResponse {
  id: number;
  uid: string;
  page: number;
  position: number;
}

export const searchMessagePosition = async ({
  userUid,
  type = "id_or_uid",
  query,
  pageSize = 50,
}: {
  userUid: string;
  type: "id_or_uid" | "content";
  query: string;
  pageSize?: number;
}): Promise<Result<SearchMessageResponse[]>> => {
  try {
    const { data } = await getApiClient.post(`/api/v1/chat/message/text/${userUid}/search`, {
      field: type,
      query,
      chat_page_size: pageSize,
      params: {
        ordering: "-created_at",
        user_uid: userUid,
      },
    });

    return { success: true, data };
  } catch (error) {
    return { success: false, error: errorHandler(error) };
  }
};
