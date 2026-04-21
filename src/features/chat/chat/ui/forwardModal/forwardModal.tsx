import Close from "@icons/close.svg";
import { AlertDialogDescription, AlertDialogTitle } from "@radix-ui/react-alert-dialog";
import Link from "next/link";
import { useState } from "react";

import { useChatStore } from "@/entities/chat/model/useChatStore";
import { Avatar } from "@/entities/chat/ui/avatar";
import { ModalDialog } from "@/shared/modalDialog/ui/modalDialog";
import { cn } from "@/shared/shadcn/lib/utils";
import { AlertDialogHeader } from "@/shared/shadcn/ui/alert-dialog";
import { Searchbar } from "@/shared/ui/searchbar";
import { Statusbar } from "@/shared/ui/statusbar/ui/statusbar";

import { ChatListDataProvider } from "../../../../chatList/ui/chatListProvider";

type ForwardModalProps = {
  className?: string;
  isOpen: boolean;
  chatKey: string;
  onClose: () => void;
};

export const ForwardModal: React.FC<ForwardModalProps> = ({ className, isOpen, onClose }) => {
  const [search, setSearch] = useState("");
  const { setForwardTargets, chatKey, chatKeyUser } = useChatStore();

  const handleClose = () => {
    setForwardTargets([]);
    onClose();
  };

  return (
    <ModalDialog
      className={cn(
        "desktop:w-[360px] desktop:max-w-[360px] flex max-h-[85vh] flex-col overflow-hidden bg-white p-0 pt-3 pb-0",
        className,
      )}
      open={isOpen}
      onOpenChange={handleClose}
    >
      <AlertDialogHeader className="px-0">
        {" "}
        <div className="flex w-full items-center justify-between gap-2 px-4 pb-2">
          <AlertDialogTitle className="subtext text-black">Переслать</AlertDialogTitle>
          <Close
            className="h-3 w-3 cursor-pointer text-black transition duration-200 hover:opacity-80"
            onClick={handleClose}
          />
        </div>
        <div className="border-muted w-full border-t border-b px-4 py-2">
          <Searchbar onChange={setSearch} value={search} className="w-full" />
        </div>
      </AlertDialogHeader>

      <AlertDialogDescription className="sr-only"></AlertDialogDescription>

      <ChatListDataProvider search={search}>
        {({ chats, loadMoreRef }) => (
          <div className="flex max-h-[420px] min-h-0 flex-1 flex-col overflow-y-auto">
            {chats.map((chat) => (
              <div key={chat.key}>
                <Link
                  className={cn(
                    "hover:bg-primary-accent-light flex w-full min-w-0 items-center gap-3 px-4 py-2 text-sm transition-colors duration-200",
                    (chat.key === chatKey || chat.key === chatKeyUser) &&
                      "border-primary-accent border-y-2",
                  )}
                  href={chat.type === "chat" ? `/chats/${chat.member.uid}` : `/chats/${chat.key}`}
                  onClick={onClose}
                >
                  <div className="flex-shrink-0">
                    {" "}
                    <Avatar
                      avatarUrl={
                        chat.member.avatar_url || chat.avatar.webp || chat.avatar.jpg || ""
                      }
                      size="sm"
                    />
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="block truncate font-medium text-black">
                      {chat.title || `${chat.member.first_name} ${chat.member.last_name}`}
                    </span>

                    {chat.type === "chat" ? (
                      <div className="truncate">
                        <Statusbar
                          time={chat.lastActivityAt}
                          chatType={chat.type}
                          isOnline={chat.member.is_online}
                        />
                      </div>
                    ) : (
                      <span className="text-gray truncate text-xs">
                        {chat.type.includes("group") ? "публичная группа" : "публичный канал"}
                      </span>
                    )}
                  </div>
                </Link>
              </div>
            ))}
            <div ref={loadMoreRef} className="h-1" />
          </div>
        )}
      </ChatListDataProvider>
    </ModalDialog>
  );
};
