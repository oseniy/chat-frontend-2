import { errorHandler } from "@/shared/api/errorHandler";
import getApiClient from "@/shared/api/getApiClient";
import { Result } from "@/shared/api/types";

export type IceServerDto = {
  urls: string[];
  username?: string;
  credential?: string;
};

type CallConfigDto = { ice_servers: IceServerDto[] };

export const getIceServers = async (): Promise<Result<RTCIceServer[]>> => {
  try {
    const { data } = await getApiClient.get<CallConfigDto[] | CallConfigDto>(
      "/api/v1/chat/calls/ice-servers/",
    );
    const configs = Array.isArray(data) ? data : [data];
    const servers: RTCIceServer[] = configs.flatMap((cfg) =>
      (cfg.ice_servers ?? []).map((s) => ({
        urls: s.urls,
        username: s.username,
        credential: s.credential,
      })),
    );
    return { success: true, data: servers };
  } catch (error) {
    return { success: false, error: errorHandler(error) };
  }
};
