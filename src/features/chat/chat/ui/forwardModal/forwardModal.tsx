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
      className={cn("desktop:w-[360px] desktop:max-w-[360px] bg-white p-0 pt-3 pb-0", className)}
      open={isOpen}
      onOpenChange={handleClose}
    >
      <AlertDialogHeader>
        <AlertDialogTitle className="flex flex-col items-center justify-between gap-2">
          <div className="flex w-full items-center justify-between gap-2 px-4">
            <span className="subtext text-black">Переслать</span>
            <Close
              className="h-3 w-3 cursor-pointer text-black transition duration-200 hover:opacity-80"
              onClick={handleClose}
            />
          </div>
          <div className="border-muted w-full border-t border-b px-4 py-2">
            <Searchbar onChange={setSearch} value={search} className="w-full flex-1" />
          </div>
          <ChatListDataProvider search={search}>
            {({ chats, loadMoreRef }) => (
              <div className="flex max-h-[420px] w-full flex-col overflow-y-auto">
                {chats.map((chat) => (
                  <div key={chat.key}>
                    <Link
                      className={cn(
                        "hover:bg-primary-accent-light flex items-center gap-2 py-2 pl-4 text-sm transition-colors duration-200",
                        (chat.key === chatKey || chat.key === chatKeyUser) &&
                          "border-primary-accent border-y-2",
                      )}
                      href={
                        chat.type === "chat" ? `/chats/${chat.member.uid}` : `/chats/${chat.key}`
                      }
                      onClick={onClose}
                    >
                      <Avatar
                        avatarUrl={
                          chat.member.avatar_url || chat.avatar.webp || chat.avatar.jpg || ""
                        }
                        size="sm"
                      />
                      <div className="flex flex-col">
                        <span>
                          {chat.title || chat.member.first_name + " " + chat.member.last_name}
                        </span>
                        {chat.type === "chat" && (
                          <Statusbar
                            time={chat.lastActivityAt}
                            chatType={chat.type}
                            isOnline={chat.member.is_online}
                          />
                        )}
                        {chat.type !== "chat" && (
                          <span className="text-gray">
                            {chat.type.includes("group") ? "публичная группа" : "публичный канал"}
                          </span>
                        )}
                      </div>
                    </Link>
                  </div>
                ))}
                <div ref={loadMoreRef} />
              </div>
            )}
          </ChatListDataProvider>
        </AlertDialogTitle>
        <AlertDialogDescription></AlertDialogDescription>
      </AlertDialogHeader>
    </ModalDialog>
  );
};
