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

type DeleteChatGlobalModalProps = {
  className?: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  chatName: string;
  modalVariant: "group" | "channel";
};

export const DeleteChatGlobalModal: React.FC<DeleteChatGlobalModalProps> = ({
  className,
  isOpen,
  onClose,
  onConfirm,
  chatName,
  modalVariant,
}) => {
  const getModalContent = () => {
    switch (modalVariant) {
      case "group":
        return {
          title: `Удалить группу «${chatName}»?`,
          description:
            "Вы точно хотите удалить эту группу и все сообщения в ней для всех участников? Это действие нельзя отменить.",
          confirmLabel: "Удалить",
        };
      case "channel":
        return {
          title: `Удалить канал «${chatName}»?`,
          description:
            "Вы точно хотите удалить этот канал и все публикации в нем для всех подписчиков? Это действие нельзя отменить.",
          confirmLabel: "Удалить",
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
