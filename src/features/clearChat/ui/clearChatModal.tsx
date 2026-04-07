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

type ClearChatModalProps = {
  className?: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  chatName: string;
  modalVariant: "group" | "channel" | "chat";
};

export const ClearChatModal: React.FC<ClearChatModalProps> = ({
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
          title: `Очистить чат?`,
          description:
            "Все сообщения в этой группе будут удалены только для вас. Участники по-прежнему смогут их видеть",
          confirmLabel: "Очистить",
        };
      case "channel":
        return {
          title: `Очистить канал «${chatName}»?`,
          description:
            "Все публикации в этом канале будут безвозвратно удалены для всех. Это действие нельзя отменить.",
          confirmLabel: "Очистить",
        };
      case "chat":
        return {
          title: `Очистить чат с ${chatName}?`,
          description:
            "Все сообщения в этом чате будут удалены только для вас. Собеседник по-прежнему сможет их видеть",
          confirmLabel: "Очистить",
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
