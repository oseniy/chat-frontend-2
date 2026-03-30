import Delete from "@icons/chat/context-menu/delete.svg";
import { useRouter } from "next/navigation";
import { MouseEvent } from "react";

import { ChatParticipant } from "@/entities/chat/model/types";
import { useModalStore } from "@/entities/modals/model/useGlobalModalStore";
import { useContextMenu } from "@/shared/ui/contextMenu/contextMenuProvider";

type UseParticipantContextMenuParams = {
  participant: ChatParticipant;
  chatKey: string;
};

export const useParticipantContextMenu = ({
  participant,
  chatKey,
}: UseParticipantContextMenuParams) => {
  const { openMenu, activeMenuId } = useContextMenu();
  const openModal = useModalStore((s) => s.openModal);
  const router = useRouter();

  const menuId = `participant-${participant.uid}`;

  return {
    onContextMenu: (e: MouseEvent) => {
      e.preventDefault();
      openMenu(
        menuId,
        [
          {
            label: "Удалить",
            icon: Delete,
            destructive: true,
            onClick: () => {
              openModal("removeParticipant", {
                participantName: participant.fullName,
                chatKey: chatKey,
                participantUid: participant.uid,
              });
            },
          },
          {
            label: "Сделать администратором",
            onClick: () => {
              openModal("makeAdmin", {
                participantName: participant.fullName,
                chatKey: chatKey,
                participantUid: participant.uid,
              });
            },
          },
          {
            label: "Посмотреть профиль",
            onClick: () => {
              router.push(`/chats/${chatKey}/participant/${participant.uid}/profile`);
            },
          },
        ],
        e.clientX,
        e.clientY,
      );
    },
    isOpen: activeMenuId === menuId,
  };
};
