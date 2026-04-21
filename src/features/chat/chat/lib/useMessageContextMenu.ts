import Copy from "@icons/chat/context-menu/copy.svg";
import Delete from "@icons/chat/context-menu/delete.svg";
import Select from "@icons/chat/context-menu/select.svg";
import Forwarded from "@icons/chat/forwardedd.svg";
import { MouseEvent } from "react";

import { useChatStore } from "@/entities/chat/model/useChatStore";
import { useModalStore } from "@/entities/modals/model/useGlobalModalStore";
import { useDeleteMessage } from "@/features/chat/chat/hooks";
import { MappedChatMessage } from "@/features/chat/chat/model/types/mappedTypes";
import { useCopyToClipboard } from "@/shared/copy/lib/useCopyToClipboard";
import { useToast } from "@/shared/toast/ui/toastProvider";
import { useContextMenu } from "@/shared/ui/contextMenu/contextMenuProvider";

export const useMessageContextMenu = (message: MappedChatMessage) => {
  const { openMenu, activeMenuId } = useContextMenu();
  const { copy } = useCopyToClipboard();
  const { openModal } = useModalStore();
  const { showToast } = useToast();
  const { setReplyTarget, chatType, setForwardTargets, enterSelectionMode } = useChatStore();
  const isOwner = useChatStore((s) => s.createdBy === s.currentUserId);
  const isAviableToDelete =
    chatType === "chat" || chatType === "public-group" || chatType === "private-group"
      ? true
      : (chatType === "public-channel" || chatType === "private-channel") && isOwner
        ? true
        : false;
  const deleteMessage = useDeleteMessage();

  const menuId = `message-${message.id}`;
  return {
    onContextMenu: (e: MouseEvent) => {
      e.preventDefault();
      openMenu(
        menuId,
        [
          { label: "Ответить", icon: Forwarded, onClick: () => setReplyTarget(message) },
          {
            label: "Переслать",
            icon: Forwarded,
            onClick: () => {
              setForwardTargets([message]);
              openModal("forward", { chatKey: message.chatKey });
            },
          },
          {
            label: "Скопировать",
            icon: Copy,
            onClick: async () => {
              await copy(message.content);
              showToast("Сообщение скопировано", {
                mobile: "/icons/toast/checkMobile.svg",
                desktop: "/icons/toast/checkDesktop.svg",
              });
            },
          },
          { label: "Выбрать", icon: Select, onClick: () => enterSelectionMode(message.uid) },
          ...(isAviableToDelete
            ? [
                {
                  label: "Удалить",
                  icon: Delete,
                  destructive: true,
                  onClick: () => {
                    deleteMessage(message.uid);
                  },
                },
              ]
            : []),
        ],
        e.clientX,
        e.clientY,
      );
    },
    isOpen: activeMenuId === menuId,
  };
};
