import { AlertDialogDescription } from "@radix-ui/react-alert-dialog";
import { useState } from "react";

import { ChatType } from "@/entities/chat/model/types";
import { useChatStore } from "@/entities/chat/model/useChatStore";
import { useChatListStore } from "@/features/chatList/model/useChatListStore";
import { pluralize } from "@/shared/lib/pluralize";
import { ModalDialog } from "@/shared/modalDialog/ui/modalDialog";
import { cn } from "@/shared/shadcn/lib/utils";
import {
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/shadcn/ui/alert-dialog";
import { Button } from "@/shared/shadcn/ui/button";
import { Checkbox } from "@/shared/ui/checkBox";

import { deleteMessagesBulkUseCase } from "./lib/deleteMessagesBulk.useCase";

export type DeleteMessageModalProps = {
  className?: string;
  isOpen: boolean;
  chatKey: string;
  messageId?: string;
  onClose: () => void;
};

export const DeleteMessageModal: React.FC<DeleteMessageModalProps> = ({
  className,
  isOpen,
  chatKey,
  messageId,
  onClose,
}) => {
  const { chatsByKey } = useChatListStore.getState();
  const {
    chatType,
    chatKeyUser,
    messages,
    currentUserId,
    isSelectionMode,
    selectedMessageUids,
    exitSelectionMode,
  } = useChatStore.getState();

  const [isChecked, setIsChecked] = useState(false);

  const messageIds = isSelectionMode
    ? Array.from(selectedMessageUids)
    : messageId
      ? [messageId]
      : [];

  const firstMessage = messages.find((msg) => msg.uid === messageIds[0]);
  const isAvailableToDelete = firstMessage && currentUserId === firstMessage.fromUser.uid;

  const name =
    chatType === "chat" && chatKeyUser
      ? `${chatsByKey[chatKeyUser]?.member.first_name} ${chatsByKey[chatKeyUser]?.member.last_name}`
      : null;

  const onDelete = async () => {
    onClose();

    exitSelectionMode();
    await deleteMessagesBulkUseCase({
      messageIds,
      chatKey,
      chatType: chatType as ChatType,
      chatKeyUser,
      forAll: isChecked,
    });
  };

  return (
    <ModalDialog
      className={cn("desktop:w-[420px]", className)}
      open={isOpen}
      onOpenChange={onClose}
    >
      <AlertDialogHeader>
        <AlertDialogTitle>
          <span className="font-medium">
            Удалить {messageIds.length > 1 ? "сообщения" : "сообщение"}
          </span>
        </AlertDialogTitle>

        <AlertDialogDescription>
          <span className="subtext text-gray">
            Вы действительно хотите удалить {messageIds.length > 1 ? messageIds.length : ""}{" "}
            {pluralize(messageIds.length, "сообщение", "сообщения", "сообщений")}?
          </span>
        </AlertDialogDescription>

        {isAvailableToDelete && (
          <div
            className="mt-3 flex cursor-pointer items-center gap-2"
            onClick={() => setIsChecked((v) => !v)}
          >
            <Checkbox checked={isChecked} />
            <span>Удалить у {chatType === "chat" ? `меня и у ${name}` : "всех"}</span>
          </div>
        )}
      </AlertDialogHeader>

      <AlertDialogFooter className="flex-row gap-2">
        <Button
          variant="default"
          size="smSubtext"
          className="bg-primary flex-1 text-white"
          onClick={onDelete}
        >
          Удалить
        </Button>

        <Button
          variant="default"
          size="smSubtext"
          className="text-primary flex-1 bg-transparent"
          onClick={onClose}
        >
          Отмена
        </Button>
      </AlertDialogFooter>
    </ModalDialog>
  );
};
