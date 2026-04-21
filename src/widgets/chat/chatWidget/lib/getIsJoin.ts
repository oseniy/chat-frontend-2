import { MappedChatDetails } from "@/entities/chat/lib/mapChat";
import { UserPreview } from "@/entities/user/model/types";

export const getIsJoin = (
  chatInfo: MappedChatDetails | UserPreview,
  userId: string | null,
): boolean => {
  if (!userId || !("type" in chatInfo)) return false;

  const memberUids = chatInfo.members.map((m) => m.uid);
  return ![...memberUids, chatInfo.createdBy].includes(userId);
};
