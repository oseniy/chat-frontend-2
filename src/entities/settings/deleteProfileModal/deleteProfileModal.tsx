import { AlertDialogDescription } from "@radix-ui/react-alert-dialog";
import { useRouter } from "next/navigation";

import { logout } from "@/shared/api/logout";
import { ModalDialog } from "@/shared/modalDialog/ui/modalDialog";
import { cn } from "@/shared/shadcn/lib/utils";
import {
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/shadcn/ui/alert-dialog";
import { Button } from "@/shared/shadcn/ui/button";

import { deleteProfile } from "./api/deleteProfile";

type DeleteProfileModalProps = {
  className?: string;
  isOpen: boolean;
  uid: string;
  onClose: () => void;
};

export const DeleteProfileModal: React.FC<DeleteProfileModalProps> = ({
  className,
  isOpen,
  onClose,
}) => {
  const router = useRouter();
  const onDelete = async () => {
    const result = await deleteProfile();
    if (result.success) {
      logout();
      router.replace("/auth");
    }
  };
  return (
    <ModalDialog className={cn(className)} open={isOpen} onOpenChange={onClose}>
      <AlertDialogHeader>
        <AlertDialogTitle>
          <span className="font-medium">Удаление профиля</span>
        </AlertDialogTitle>
        <AlertDialogDescription>
          <span className="subtext text-gray">
            Это действие необратимо. Все данные будут удалены без возможности восстановления.
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
