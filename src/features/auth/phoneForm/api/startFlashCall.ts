import { errorHandler } from "@/shared/api/errorHandler";
import { getApiClient } from "@/shared/api/getApiClient";
import { Result } from "@/shared/api/types";

type Response = {
  message?: string;
  session_uid: string;
  session_secret: string;
  poll_interval_seconds: number;
  call_number: string;
};

export const startFlashCall = async (phone: string): Promise<Result<Response>> => {
  try {
    const { data } = await getApiClient.post<Response>(
      `/api/v1/auth/providers/plusofon/flash-call/start/`,
      { phone_number: phone },
    );
    return { success: true, data };
  } catch (error) {
    return { success: false, error: errorHandler(error) };
  }
};
