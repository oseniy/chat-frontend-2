import { AlertDialogDescription } from "@radix-ui/react-alert-dialog";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { useChatInfoStore } from "@/entities/chat/model/useChatInfoStore";
import { useChatStore } from "@/entities/chat/model/useChatStore";
import { deleteChat } from "@/features/chatList/api/deleteChat";
import { useChatListStore } from "@/features/chatList/model/useChatListStore";
import { ModalDialog } from "@/shared/modalDialog/ui/modalDialog";
import { cn } from "@/shared/shadcn/lib/utils";
import {
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/shadcn/ui/alert-dialog";
import { Button } from "@/shared/shadcn/ui/button";

export type DeleteChatModalProps = {
  className?: string;
  isOpen: boolean;
  chatKey: string;
  token: string;
  onClose: () => void;
};

export const DeleteChatModal: React.FC<DeleteChatModalProps> = ({
  className,
  isOpen,
  chatKey,
  onClose,
}) => {
  const queryClient = useQueryClient();
  const activeChatKey = useChatStore((s) => s.chatKey);
  const activeChatKeyUser = useChatStore((s) => s.chatKeyUser);
  const activeChatId = useChatStore((s) => s.chatId);
  const resetActiveChat = useChatStore((s) => s.reset);
  const removeChatInfo = useChatInfoStore((s) => s.removeChatInfo);
  const { chatsByKey, removeChat, upsertChat } = useChatListStore.getState();
  const router = useRouter();
  const name =
    chatsByKey[chatKey]?.type === "chat"
      ? chatsByKey[chatKey]?.member.first_name + " " + chatsByKey[chatKey]?.member.last_name
      : chatsByKey[chatKey]?.member.nickname;

  const onDelete = async () => {
    const prev = chatsByKey[chatKey];
    if (!prev) return;

    try {
      const result = await deleteChat({ index: prev.id });
      if (!result.success) {
        throw new Error(result.error);
      }

      const isDeletingActiveChat =
        activeChatKey === chatKey ||
        activeChatKey === prev.member.uid ||
        activeChatKeyUser === chatKey ||
        activeChatId === prev.id;

      removeChat(chatKey);
      removeChatInfo(chatKey);
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      onClose();

      if (isDeletingActiveChat) {
        resetActiveChat();
        router.replace("/chats/deleted");
      }
    } catch {
      // rollback
      upsertChat(prev);
    }
  };

  return (
    <ModalDialog className={cn(className)} open={isOpen} onOpenChange={onClose}>
      <AlertDialogHeader className="min-w-0 overflow-hidden">
        <AlertDialogTitle className="max-w-full truncate">
          <span className="font-medium">Удалить чат</span>
        </AlertDialogTitle>
        <AlertDialogDescription>
          <span className="subtext text-gray">
            Удалить чат {name} без возможности восстановления?
          </span>
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter className="flex-row flex-wrap gap-2">
        <Button
          variant="default"
          size="smSubtext"
          className="desktop:text-error desktop:bg-transparent bg-primary desktop:flex-0 desktop:order-1 order-2 flex-1 text-white"
          onClick={onDelete}
        >
          Удалить
        </Button>
        <Button
          variant="default"
          size="smSubtext"
          className="text-primary border-primary desktop:bg-primary desktop:flex-0 desktop:text-white desktop:order-2 order-1 flex-1 bg-transparent"
          onClick={onClose}
        >
          <span>Отмена</span>
        </Button>
      </AlertDialogFooter>
    </ModalDialog>
  );
};
