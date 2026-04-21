import Link from "next/link";

import { ChatListItem } from "@/entities/chat/model/types";
import { AddedToContactsModal } from "@/features/contacts/addToContacts/ui/AddedToContactsModal";
import { cn } from "@/shared/shadcn/lib/utils";

import { Avatar } from "../../../entities/chat/ui/avatar";
import { useChatListItemContextMenu } from "../lib/useChatListItemContextMenu";
import { ChatActions } from "../model/types";
import { ChatListItemFooter } from "./chatListItemFooter";
import { ChatListItemHeader } from "./chatListItemHeader";

type ChatListItemProps = {
  className?: string;
  chat: ChatListItem;
  isActive?: boolean;
  isLast?: boolean;
  actions: ChatActions;
  onClick?: () => void;
};

export const ChatListItemComponent = ({
  className,
  chat,
  isActive,
  isLast = false,
  actions,
  onClick,
}: ChatListItemProps) => {
  const totalUnread = chat.unreadMessages;
  const user = chat.member;
  const { onContextMenu, isOpen, showAddedModal, handleModalClose, addedContactName } =
    useChatListItemContextMenu(chat, actions);
  return (
    <>
      <Link
        href={`/chats/${chat.key.startsWith("group") || chat.key.startsWith("channel") ? chat.key : chat.member.uid}`}
        className={cn("py-1", className)}
        onClick={onClick}
        onContextMenu={onContextMenu}
      >
        <div
          className={cn(
            "flex cursor-pointer items-stretch gap-2 rounded-md px-2.5 py-1.5 transition-colors duration-200",
            "hover:bg-primary-hover",
            chat.isFavorite && "bg-white",
            isOpen && "bg-primary-hover",
            isActive && "bg-primary-accent hover:bg-primary-accent",
          )}
        >
          <Avatar
            isOnline={user?.is_online ?? false}
            avatarUrl={user?.avatar_webp_url || user?.avatar_url || ""}
          />
          <div
            className={cn(
              "after:bg-gray relative flex min-w-0 flex-1 flex-col justify-between after:absolute after:top-[calc(100%+10px)] after:right-0 after:left-0 after:h-px after:opacity-15 after:content-['']",
              isLast && "after:hidden",
            )}
          >
            <ChatListItemHeader chat={chat} isActive={isActive} />
            <ChatListItemFooter
              isFavorite={chat.isFavorite}
              lastMsg={chat.lastMessage}
              isActive={isActive}
              totalUnread={totalUnread}
            />
          </div>
        </div>
      </Link>
      <AddedToContactsModal
        isOpen={showAddedModal}
        onClose={handleModalClose}
        firstName={addedContactName.firstName}
        lastName={addedContactName.lastName}
      />
    </>
  );
};
