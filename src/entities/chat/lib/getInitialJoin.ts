import { MappedChatDetails } from "@/entities/chat/lib/mapChat";
import { getProfileServer } from "@/entities/user/api/getProfileServer";
import { UserPreview } from "@/entities/user/model/types";
import { getIsJoin } from "@/widgets/chat/chatWidget/lib/getIsJoin";

export const getInitialJoin = async (
  chatInfo: MappedChatDetails | UserPreview,
): Promise<boolean> => {
  const profileResult = await getProfileServer();
  if (!profileResult.success) return false;
  return getIsJoin(chatInfo, profileResult.data.uid);
};
