import AttachBtn from "@icons/chat/attachBtn.svg";
import Close from "@icons/close.svg";
import { AlertDialogDescription } from "@radix-ui/react-alert-dialog";

import { openFilePicker } from "@/features/chat/chat/lib/openFilePicker";
import { useSendFilesStore } from "@/features/chat/chat/model/store/useChatSendFilesStore";
import { MessageForm } from "@/features/chat/sendMessage/ui/messageForm";
import { pluralize } from "@/shared/lib/pluralize";
import { useKeyboardOffset } from "@/shared/lib/useKeyboardOffset";
import { ModalDialog } from "@/shared/modalDialog/ui/modalDialog";
import { cn } from "@/shared/shadcn/lib/utils";
import { AlertDialogHeader, AlertDialogTitle } from "@/shared/shadcn/ui/alert-dialog";
import { Button } from "@/shared/shadcn/ui/button";
import { FileList } from "@/shared/ui/fileList/fileList";

import { useSendMessage } from "../../hooks";
export type SendFileModalProps = {
  className?: string;
  isOpen: boolean;
  chatKey: string;
  messageId: string;
  onClose: () => void;
};

export const SendFileModal: React.FC<SendFileModalProps> = ({ className, isOpen, onClose }) => {
  const files = useSendFilesStore((s) => s.attachments);
  const { clear, addFiles } = useSendFilesStore();
  const { isKeyboardOpen } = useKeyboardOffset();

  const handleClose = () => {
    clear();
    onClose();
  };

  const handleAttach = async () => {
    const files = await openFilePicker();
    if (files.length) addFiles(files);
  };

  const sendMessage = useSendMessage();

  const handleSend = async (text: string) => {
    handleClose();
    await sendMessage(text, [], files);
  };

  if (!files.length) return null;
  return (
    <ModalDialog
      className={cn(
        "desktop:w-[432px] desktop:max-w-[432px] bg-[#F5F6F8] p-0 py-6 pl-5",
        className,
      )}
      open={isOpen}
      onOpenChange={handleClose}
    >
      <AlertDialogHeader>
        <AlertDialogTitle className="flex items-center justify-between gap-2 pr-5">
          <div className="flex items-center gap-2">
            <span className="font-medium">
              Отправить {files.length} {pluralize(files.length, "файл", "файла", "файлов")}
            </span>
            <Button
              variant="text"
              size="icon"
              onClick={handleAttach}
              className="hover:bg-primary-hover h-8 w-8 rounded-md transition-colors duration-200"
              aria-label="Прикрепить"
            >
              <AttachBtn className="text-gray hover:text-primary h-8 w-8" />
            </Button>
          </div>
          <Close
            className="h-4 w-4 cursor-pointer text-black transition duration-200 hover:opacity-80"
            onClick={handleClose}
          />
        </AlertDialogTitle>
        <AlertDialogDescription></AlertDialogDescription>
        <div className="w-full">
          <FileList files={files} />
          <MessageForm
            className="mt-4 p-0 pr-5"
            variant="modal"
            isKeyboardOpen={isKeyboardOpen}
            onSubmitMessage={handleSend}
            isAttachBtnDisabled={true}
            isVoiceBtnDisabled={true}
            placeholder="Добавить подпись"
          />
        </div>
      </AlertDialogHeader>
    </ModalDialog>
  );
};
