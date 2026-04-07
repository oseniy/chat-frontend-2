import Mute from "@icons/chat/mute.svg";

import { ChatListItem } from "@/entities/chat/model/types";
import { useUserStore } from "@/entities/user/model/userStore";
import { MESSAGE_STATUS } from "@/shared/constants/constants";
import { cn } from "@/shared/shadcn/lib/utils";

import { formatLastSeen } from "../../../entities/chat/lib/formatLastSeen";
import { getChatDisplayName } from "../../../entities/chat/lib/getUserDisplayName";
import { StatusIcon } from "../../../entities/chat/ui/statusIcon";

type ChatListItemHeaderProps = {
  chat: ChatListItem;
  isActive?: boolean;
};

export const ChatListItemHeader = ({ chat, isActive }: ChatListItemHeaderProps) => {
  const lastMsg = chat.lastMessage;
  const displayName = getChatDisplayName(chat);
  const time = lastMsg ? formatLastSeen(lastMsg.created_at) : "";
  const userId = useUserStore((s) => s.userId);

  const status =
    chat.unreadMessages > 0 || lastMsg?.new ? MESSAGE_STATUS.DELIVERED : MESSAGE_STATUS.READ;

  return (
    <div className="flex min-w-0 items-center justify-between">
      <div className="flex min-w-0 items-center gap-1.5">
        <h3
          className={cn(
            "subtext desktop:text min-w-0 truncate font-semibold text-black transition-colors duration-200",
            isActive && "text-white",
          )}
        >
          {displayName}
        </h3>
        {!chat.notificationsEnabled && (
          <Mute
            className={cn(
              "desktop:w-3.5 desktop:h-3.5 text-gray h-[11px] w-[11px] shrink-0 transition-colors duration-200",
              isActive && "text-white",
            )}
          />
        )}
      </div>
      <div className="flex shrink-0 items-center gap-1 pl-2">
        {userId === chat.lastMessage?.from_user && lastMsg && (
          <StatusIcon status={status} isActive={Boolean(isActive)} />
        )}
        <span
          className={cn(
            "desktop:minitext caption text-gray leading-none transition-colors duration-200",
            isActive && "text-white",
          )}
        >
          {time}
        </span>
      </div>
    </div>
  );
};
