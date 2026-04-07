"use client";

import { AlertDialogDescription } from "@radix-ui/react-alert-dialog";

import { getChatTypeLight } from "@/entities/chat/lib/getChatTypeLight";
import { ModalDialog } from "@/shared/modalDialog/ui/modalDialog";
import { cn } from "@/shared/shadcn/lib/utils";
import {
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/shadcn/ui/alert-dialog";
import { Button } from "@/shared/shadcn/ui/button";

import { useMakeAdmin } from "../lib/useMakeAdmin";

type MakeAdminModalProps = {
  className?: string;
  isOpen: boolean;
  onClose: () => void;
  participantName: string;
  chatKey: string;
  participantUid: string;
};

export const MakeAdminModal: React.FC<MakeAdminModalProps> = ({
  className,
  isOpen,
  onClose,
  participantName,
  participantUid,
  chatKey,
}) => {
  const chatType = getChatTypeLight(chatKey);
  const { confirm, isLoading } = useMakeAdmin({
    chatKey,
    chatType,
    participantUid: participantUid,
    participantName: participantName,
  });
  return (
    <ModalDialog className={cn(className)} open={isOpen} onOpenChange={onClose}>
      <AlertDialogHeader>
        <AlertDialogTitle>
          <span className="font-medium">
            Назначить {participantName} владельцем {chatType === "channel" ? "канала" : "группы"}?
          </span>
        </AlertDialogTitle>
        <AlertDialogDescription>
          <span className="subtext text-gray">
            Правами администратора будет обладать только выбранный пользователь
          </span>
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter className="flex-row flex-wrap gap-2">
        <Button
          variant="default"
          size="smSubtext"
          className="desktop:text-error desktop:bg-transparent bg-primary desktop:flex-0 desktop:order-1 order-2 flex-1 text-white"
          onClick={confirm}
          disabled={isLoading}
        >
          Назначить
        </Button>
        <Button
          variant="default"
          size="smSubtext"
          className="text-primary border-primary desktop:bg-primary desktop:flex-0 desktop:text-white desktop:order-2 order-1 flex-1 bg-transparent"
          onClick={onClose}
        >
          Отменить
        </Button>
      </AlertDialogFooter>
    </ModalDialog>
  );
};
