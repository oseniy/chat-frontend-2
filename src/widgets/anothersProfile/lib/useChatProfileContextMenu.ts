import erase from "@icons/erase.svg";
import exit from "@icons/menu/exit.svg";
import trashCan from "@icons/trashCan.svg";
import { MouseEvent, useMemo } from "react";

import { ChatType } from "@/entities/chat/model/types";
import { useModalStore } from "@/entities/modals/model/useGlobalModalStore";
import { useClearChat } from "@/features/clearChat/lib/useClearChat";
import { useDeleteChatGlobal } from "@/features/deleteChatGlobal/lib/useDeleteChatGlobal";
import { useLeaveChat } from "@/features/leaveChat/lib/useLeaveChat";
import { MenuItem, useContextMenu } from "@/shared/ui/contextMenu/contextMenuProvider";

type UseChatProfileContextMenuParams = {
  isOwner: boolean;
  chatType: "group" | "channel" | "chat";
  chatKey: string;
  chatName: string;
  fullChatType: ChatType;
  chatId: number | null;
};

export const useChatProfileContextMenu = ({
  isOwner,
  chatType,
  chatKey,
  chatName,
  fullChatType,
  chatId,
}: UseChatProfileContextMenuParams) => {
  const menuId = "chatProfile";
  const { openMenu, activeMenuId } = useContextMenu();
  const openModal = useModalStore((s) => s.openModal);

  const { leaveModalVariant, confirmLeave } = useLeaveChat({
    chatKey,
    chatName,
    chatType: fullChatType,
  });

  const { deleteModalGlobalVariant, confirmDelete } = useDeleteChatGlobal({
    chatKey,
    chatName,
    chatType: fullChatType,
  });
  const { clearChatModalVariant, confirmClear } = useClearChat({
    chatId,
    chatName,
    chatType: fullChatType,
  });

  const clearLabel = chatType === "channel" ? "Очистить канал" : "Очистить чат";
  const leaveLabel = chatType === "channel" ? "Покинуть канал" : "Покинуть группу";
  const deleteLabel = chatType === "channel" ? "Удалить канал" : "Удалить группу";

  const menuItems = useMemo(() => {
    const items: MenuItem[] = [
      {
        label: clearLabel,
        icon: erase,
        onClick: () => {
          openModal("clearChat", {
            chatName,
            modalVariant: clearChatModalVariant,
            onConfirm: confirmClear,
          });
        },
      },
    ];

    if ((chatType === "channel" && !isOwner) || chatType === "group")
      items.push({
        label: leaveLabel,
        icon: exit,
        onClick: () => {
          openModal("leaveChat", {
            chatName,
            modalVariant: leaveModalVariant,
            onConfirm: confirmLeave,
          });
        },
      });

    if (isOwner) {
      items.push({
        label: deleteLabel,
        icon: trashCan,
        destructive: true,
        onClick: () => {
          openModal("deleteChatGlobal", {
            chatName,
            modalVariant: deleteModalGlobalVariant,
            onConfirm: confirmDelete,
          });
        },
      });
    }

    return items;
  }, [
    chatType,
    clearLabel,
    leaveLabel,
    deleteLabel,
    isOwner,
    openModal,
    chatName,
    clearChatModalVariant,
    confirmClear,
    leaveModalVariant,
    confirmLeave,
    deleteModalGlobalVariant,
    confirmDelete,
  ]);

  return useMemo(
    () => ({
      onContextMenu: (e: MouseEvent) => {
        e.preventDefault();
        openMenu(menuId, menuItems, e.clientX, e.clientY);
      },
      isOpen: activeMenuId === menuId,
    }),
    [openMenu, menuItems, activeMenuId],
  );
};
