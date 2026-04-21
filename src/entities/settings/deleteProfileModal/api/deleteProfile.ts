import { errorHandler } from "@/shared/api/errorHandler";
import getApiClient from "@/shared/api/getApiClient";

export const deleteProfile = async () => {
  try {
    const result = await getApiClient.delete(`/api/v1/auth/messenger/profile/`);
    return { success: true, data: result.data };
  } catch (error) {
    return { success: false, error: errorHandler(error) };
  }
};
