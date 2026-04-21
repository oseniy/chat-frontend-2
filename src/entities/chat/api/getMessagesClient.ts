import { ChatMessageList } from "@/features/chat/chat/model/types/serverTypes";
import { errorHandler } from "@/shared/api/errorHandler";
import getApiClient from "@/shared/api/getApiClient";
import { Result } from "@/shared/api/types";

export interface GetMessagesParams {
  uid: string;
  from_me?: boolean;
  new?: boolean;
  ordering?: string;
  page?: number;
  page_size?: number;
  search?: string;
  range_time_start_created?: number;
  range_time_end_created?: number;
  range_time_start_updated?: number;
  range_time_end_updated?: number;
}

export const getMessagesClient = async (
  params: GetMessagesParams,
): Promise<Result<ChatMessageList>> => {
  try {
    const { data } = await getApiClient.get<ChatMessageList>(
      `/api/v1/chat/message/text/${params.uid}/`,
      {
        params: {
          ...params,
          page_size: params.page_size || 50,
        },
      },
    );
    return { success: true, data };
  } catch (error) {
    return { success: false, error: errorHandler(error) };
  }
};
