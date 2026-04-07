import Close from "@icons/close.svg";

import { useJoinToChat } from "@/features/joinToChat/lib/useJoinToChat";
import { pluralize } from "@/shared/lib/pluralize";
import { ModalDialog } from "@/shared/modalDialog/ui/modalDialog";
import { cn } from "@/shared/shadcn/lib/utils";
import {
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/shadcn/ui/alert-dialog";
import { Button } from "@/shared/shadcn/ui/button";
import { InfoItem } from "@/shared/ui/infoItems/infoItem";

import { getChatTypeLight } from "../lib/getChatTypeLight";
import { ChatPreview } from "../model/types";
import { Avatar } from "./avatar";

type ChatPreviewModalProps = {
  className?: string;
  chatKey: string;
  isOpen: boolean;
  onClose: () => void;
  previewData: ChatPreview;
  token: string;
};

export const ChatPreviewModal: React.FC<ChatPreviewModalProps> = ({
  className,
  chatKey,
  isOpen,
  onClose,
  previewData,
  token,
}) => {
  const chatType = getChatTypeLight(chatKey);
  const { onJoin, isLoading } = useJoinToChat({ chatKey, token, closeModal: onClose });
  return (
    <ModalDialog className={cn(className, "px-2 pt-2 pb-6")} open={isOpen} onOpenChange={onClose}>
      <AlertDialogHeader className="relative flex w-full min-w-0 items-center justify-between gap-2 overflow-hidden">
        <Close
          className="absolute top-1 right-1 h-3 w-3 cursor-pointer text-black transition duration-200 hover:opacity-80"
          onClick={() => onClose()}
        />
        <div className="mt-4 flex w-full flex-col items-center justify-center gap-3">
          <Avatar avatarUrl={previewData.avatarUrl} size="lg" variant="chat" />
          <div className="flex w-full min-w-0 flex-col items-center justify-center gap-1 px-8">
            <AlertDialogTitle className="title max-w-full truncate text-center">
              {previewData.name}
            </AlertDialogTitle>
            <p className="subtext text-gray">
              {chatType === "group"
                ? `${previewData.participantsCount} ${pluralize(previewData.participantsCount, "участник", "участника", "участников")}`
                : `${previewData.participantsCount - 1} ${pluralize(previewData.participantsCount - 1, "подписчик", "подписчика", "подписчиков")}`}
            </p>
          </div>
        </div>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <div className="desktop:px-8 flex w-full flex-col gap-5 px-4">
          {previewData.description && (
            <div className="bg-main-light-gray flex w-full flex-col rounded-lg">
              <InfoItem
                title="Описание"
                text={previewData.description}
                className="line-clamp-4 break-all text-black"
              ></InfoItem>
            </div>
          )}
          <Button onClick={onJoin} disabled={isLoading}>
            {chatType === "group" ? "Вступить в группу" : "Подписаться"}
          </Button>
        </div>
      </AlertDialogFooter>
    </ModalDialog>
  );
};
