import { AlertDialogTitle } from "@radix-ui/react-alert-dialog";
import { useState } from "react";

import { useDeleteSelectedContacts } from "@/features/contacts/deleteContacts/lib/useDeleteSelectedContacts";
import { pluralize } from "@/shared/lib/pluralize";
import { ModalDialog } from "@/shared/modalDialog/ui/modalDialog";
import { cn } from "@/shared/shadcn/lib/utils";
import {
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
} from "@/shared/shadcn/ui/alert-dialog";
import { Button } from "@/shared/shadcn/ui/button";

import { useSelectContactsStore } from "../../model/SelectContactsStore";

type DeleteContactsModalProps = {
  className?: string;
  isOpen: boolean;
  onClose: () => void;
};

export const DeleteContactsModal: React.FC<DeleteContactsModalProps> = ({
  className,
  isOpen,
  onClose,
}) => {
  const { mutate } = useDeleteSelectedContacts();
  const selected = useSelectContactsStore((s) => s.selected);
  // 1. Храним текущую длину и предыдущую для сравнения
  const [prevLength, setPrevLength] = useState(selected.length);
  const [frozenCount, setFrozenCount] = useState(selected.length);

  // 2. Логика синхронизации прямо в теле компонента
  if (selected.length !== prevLength) {
    setPrevLength(selected.length); // Обновляем "предыдущую" длину

    // Замораживаем число, только если оно больше нуля
    // Если стор сбросился в 0, frozenCount сохранит старое значение
    if (selected.length > 0) {
      setFrozenCount(selected.length);
    }
  }

  // Используем замороженное число
  const text =
    frozenCount === 1
      ? "Вы уверены, что хотите удалить контакт"
      : "Вы уверены, что хотите удалить " +
        frozenCount +
        pluralize(frozenCount, " контакт", " контакта", " контактов");

  return (
    <ModalDialog className={cn(className)} open={isOpen} onOpenChange={onClose}>
      <AlertDialogHeader>
        <AlertDialogHeader>
          <AlertDialogTitle>
            <span className="font-medium">Удалить {frozenCount > 1 ? "контакты" : "контакт"}</span>
          </AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogDescription>
          <span className="subtext text-gray">{text}?</span>
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter className="flex flex-row flex-wrap gap-2">
        <Button
          variant="default"
          size="smSubtext"
          className="text-primary desktop:flex-0 flex-1 bg-transparent"
          onClick={onClose}
        >
          Отмена
        </Button>
        <Button
          variant="default"
          size="smSubtext"
          onClick={() => mutate()}
          className="desktop:flex-0 flex-1"
        >
          <span>Удалить</span>
        </Button>
      </AlertDialogFooter>
    </ModalDialog>
  );
};
