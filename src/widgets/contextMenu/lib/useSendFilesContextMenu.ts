import { MouseEvent } from "react";

import { useModalStore } from "@/entities/modals/model/useGlobalModalStore";
import { openFilePicker } from "@/features/chat/chat/lib/openFilePicker";
import { openImagePicker } from "@/features/chat/chat/lib/openImagePicker";
import { useSendFilesStore } from "@/features/chat/chat/model/store/useChatSendFilesStore";
import { useSendImageStore } from "@/features/chat/chat/model/store/useChatSendImagesStore";
import { useToast } from "@/shared/toast/ui/toastProvider";
import { useContextMenu } from "@/shared/ui/contextMenu/contextMenuProvider";
import File from "@/shared/ui/icons/sendFiles/file.svg";
import Image from "@/shared/ui/icons/sendFiles/image.svg";

export const useSendFilesContextMenu = () => {
  const { openMenu, activeMenuId } = useContextMenu();
  const { showToast } = useToast(); // Подключаем тосты

  const addImages = useSendImageStore((s) => s.addImages);
  const addFiles = useSendFilesStore((s) => s.addFiles);
  const openModal = useModalStore((s) => s.openModal);
  const menuId = "sendFiles";

  const errorIcon = {
    mobile: "/icons/toast/block.svg.",
    desktop: "/icons/toast/block.svg",
  };

  return {
    onContextMenu: (e: MouseEvent) => {
      e.preventDefault();
      openMenu(
        menuId,
        [
          {
            label: "Выбрать изображение",
            icon: Image,
            onClick: async () => {
              const files = await openImagePicker();
              const validImages = files.filter((f) => f.size > 0);

              if (validImages.length < files.length) {
                showToast("Пустые изображения нельзя отправить", errorIcon);
              }

              if (validImages.length > 0) {
                addImages(validImages);
                openModal("sendImage", { chatKey: "" });
              }
            },
          },
          {
            label: "Выбрать файл",
            icon: File,
            onClick: async () => {
              const files = await openFilePicker();
              const validFiles = files.filter((f) => f.size > 0);

              if (validFiles.length < files.length) {
                showToast("Файл пуст", errorIcon);
              }

              if (validFiles.length > 0) {
                addFiles(validFiles);
                openModal("sendFile", { chatKey: "" });
              }
            },
          },
        ],
        e.clientX,
        e.clientY,
        "top-right",
      );
    },
    isOpen: activeMenuId === menuId,
  };
};
