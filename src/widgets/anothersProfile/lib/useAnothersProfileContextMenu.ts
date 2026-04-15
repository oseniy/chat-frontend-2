"use client";

import block from "@icons/block.svg";
import forwardedd from "@icons/chat/forwardedd.svg";
import erase from "@icons/erase.svg";
import { MouseEvent, useMemo } from "react";

import { useModalStore } from "@/entities/modals/model/useGlobalModalStore";
import { useClearChat } from "@/features/clearChat/lib/useClearChat";
import { useContextMenu } from "@/shared/ui/contextMenu/contextMenuProvider";

type UseAnothersProfileContextMenuParams = {
  chatId: number | null;
  chatName: string;
};

export const useAnothersProfileContextMenu = ({
  chatId,
  chatName,
}: UseAnothersProfileContextMenuParams) => {
  const { openMenu, activeMenuId } = useContextMenu();
  const openModal = useModalStore((s) => s.openModal);
  const menuId = "anothersProfile";

  const { clearChatModalVariant, confirmClear } = useClearChat({
    chatId,
    chatName,
    chatType: "chat",
  });

  return useMemo(
    () => ({
      onContextMenu: (e: MouseEvent) => {
        e.preventDefault();
        openMenu(
          menuId,
          [
            {
              label: "Поделиться профилем",
              icon: forwardedd,
              onClick: () => {
                // Логика заглушки
              },
            },
            {
              label: "Очистить чат",
              icon: erase,
              onClick: () => {
                openModal("clearChat", {
                  chatName,
                  modalVariant: clearChatModalVariant,
                  onConfirm: confirmClear,
                });
              },
            },
            {
              label: "Заблокировать",
              icon: block,
              destructive: true,
              onClick: () => {
                // Логика заглушки
              },
            },
          ],
          e.clientX,
          e.clientY,
        );
      },
      isOpen: activeMenuId === menuId,
    }),
    [openMenu, activeMenuId, chatName, clearChatModalVariant, confirmClear, openModal],
  );
};
