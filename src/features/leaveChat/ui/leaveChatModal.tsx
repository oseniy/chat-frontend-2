"use client";

import { AlertDialogDescription } from "@radix-ui/react-alert-dialog";

import { ModalDialog } from "@/shared/modalDialog/ui/modalDialog";
import { cn } from "@/shared/shadcn/lib/utils";
import {
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/shadcn/ui/alert-dialog";
import { Button } from "@/shared/shadcn/ui/button";

type LeaveChatModalProps = {
  className?: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  chatName: string;
  modalVariant: "public-group" | "private-group" | "channel";
};

export const LeaveChatModal: React.FC<LeaveChatModalProps> = ({
  className,
  isOpen,
  onClose,
  onConfirm,
  chatName,
  modalVariant,
}) => {
  const getModalContent = () => {
    switch (modalVariant) {
      case "public-group":
        return {
          title: `Покинуть группу «${chatName}»?`,
          description: "Это открытая группа — вы сможете вернуться в любой момент",
          confirmLabel: "Покинуть",
        };
      case "private-group":
        return {
          title: `Покинуть группу «${chatName}»?`,
          description: "Вы не сможете просматривать сообщения и вернуться в группу без приглашения",
          confirmLabel: "Покинуть",
        };
      case "channel":
        return {
          title: `Покинуть канал «${chatName}»?`,
          description: "",
          confirmLabel: "Отписаться",
        };
    }
  };

  const content = getModalContent();

  return (
    <ModalDialog className={cn(className)} open={isOpen} onOpenChange={onClose}>
      <AlertDialogHeader className="min-w-0 overflow-hidden">
        <AlertDialogTitle className="max-w-full truncate">
          <span className="font-medium">{content.title}</span>
        </AlertDialogTitle>
        {content.description && (
          <AlertDialogDescription>
            <span className="subtext text-gray">{content.description}</span>
          </AlertDialogDescription>
        )}
      </AlertDialogHeader>
      <AlertDialogFooter className="flex-row flex-wrap gap-2">
        <Button
          variant="default"
          size="smSubtext"
          className="desktop:text-error desktop:bg-transparent bg-primary desktop:flex-0 desktop:order-1 order-2 flex-1 text-white"
          onClick={onConfirm}
        >
          {content.confirmLabel}
        </Button>
        <Button
          variant="default"
          size="smSubtext"
          className="text-primary border-primary desktop:bg-primary desktop:flex-0 desktop:text-white desktop:order-2 order-1 flex-1 bg-transparent"
          onClick={onClose}
        >
          <span>Отменить</span>
        </Button>
      </AlertDialogFooter>
    </ModalDialog>
  );
};
