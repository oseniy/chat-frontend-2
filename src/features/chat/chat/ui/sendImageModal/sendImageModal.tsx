import AttachBtn from "@icons/chat/attachBtn.svg";
import Close from "@icons/close.svg";
import { AlertDialogDescription } from "@radix-ui/react-alert-dialog";

import { useSendMessage } from "@/features/chat/chat/hooks";
import { useSendImageStore } from "@/features/chat/chat/model/store/useChatSendImagesStore";
import { MessageForm } from "@/features/chat/sendMessage/ui/messageForm";
import { useKeyboardOffset } from "@/shared/lib/useKeyboardOffset";
import { ModalDialog } from "@/shared/modalDialog/ui/modalDialog";
import { cn } from "@/shared/shadcn/lib/utils";
import { AlertDialogHeader, AlertDialogTitle } from "@/shared/shadcn/ui/alert-dialog";
import { Button } from "@/shared/shadcn/ui/button";
import { MediaGrid, MediaItem } from "@/shared/ui/mediaGrid/mediaGrid";

import { openImagePicker } from "../../lib/openImagePicker";

export type SendImageModalProps = {
  className?: string;
  isOpen: boolean;
  chatKey: string;
  messageId: string;
  onClose: () => void;
};

export const SendImageModal: React.FC<SendImageModalProps> = ({ className, isOpen, onClose }) => {
  const images = useSendImageStore((s) => s.images);
  const { clear, addImages } = useSendImageStore();
  const { isKeyboardOpen } = useKeyboardOffset();
  const sendMessage = useSendMessage();
  const imagesToUpload: MediaItem[] = images.map((img) => {
    const obj = {
      id: img.id,
      type: "image" as const,
      src: img.previewUrl,
    };
    return obj;
  });

  const handleClose = () => {
    clear();
    onClose();
  };

  const handleAttach = async () => {
    const files = await openImagePicker();
    if (files.length) addImages(files);
  };

  const handleSend = async (text: string) => {
    // if (images.length === 0) return;
    handleClose();
    await sendMessage(text || "", images, []);
  };

  if (!images.length) return null;
  return (
    <ModalDialog
      className={cn("desktop:w-[432px] desktop:max-w-[432px] bg-[#F5F6F8]", className)}
      open={isOpen}
      onOpenChange={handleClose}
    >
      <AlertDialogHeader>
        <AlertDialogTitle className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-medium">Отправить медиа-файл</span>
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
        <div className="">
          <MediaGrid items={imagesToUpload} size="sendImageModal" className="w-full" isDeleteMode />
          <MessageForm
            className="mt-4 p-0"
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
