import Forwarded from "@icons/chat/forwardedd.svg";

import { ChatListItem } from "@/entities/chat/model/types";
import { useUserStore } from "@/entities/user/model/userStore";
import { cn } from "@/shared/shadcn/lib/utils";

import { getLastMessagePreview } from "../../../entities/chat/lib/getLastMessagePreview";
import { ChatListItemMediaIcons } from "./chatListItemMediaIcons";

type MessagePreviewProps = {
  lastMsg: ChatListItem["lastMessage"];
  isActive?: boolean;
};

export const MessagePreview = ({ lastMsg, isActive }: MessagePreviewProps) => {
  const userId = useUserStore((s) => s.userId);
  const { icons: messageIcons, text: messageText } = getLastMessagePreview({
    content: lastMsg?.content,
    files: lastMsg?.files_summary || null,
    call: lastMsg?.message_rtc || null,
    isMine: !!userId && lastMsg?.from_user === userId,
  });
  return (
    <div className="minitext text-text-gray line-clamp-2 flex min-w-0 items-start">
      {!lastMsg?.has_replied_message && lastMsg?.has_forwarded_message && (
        <Forwarded
          className={cn(
            "text-gray mt-0.5 mr-1.5 h-3 w-3.5 shrink-0 transition-colors duration-200",
            isActive && "text-white",
          )}
        />
      )}
      {messageIcons.length !== 0 && (
        <div className="mr-1 flex w-fit min-w-fit items-center gap-0.5">
          <ChatListItemMediaIcons icons={messageIcons} />
        </div>
      )}
      <p
        className={`wrap-break-words minitext-tight text-gray emojis-apple line-clamp-2 transition-colors duration-200 ${
          isActive ? "text-white" : ""
        }`}
      >
        {messageText}
      </p>
    </div>
  );
};
