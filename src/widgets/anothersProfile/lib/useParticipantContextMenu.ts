import Delete from "@icons/chat/context-menu/delete.svg";
import { useRouter } from "next/navigation";
import { MouseEvent } from "react";

import { ChatParticipant } from "@/entities/chat/model/types";
import { useModalStore } from "@/entities/modals/model/useGlobalModalStore";
import { useContextMenu } from "@/shared/ui/contextMenu/contextMenuProvider";

type UseParticipantContextMenuParams = {
  participant: ChatParticipant;
  chatKey: string;
  isOwner: boolean;
};

export const useParticipantContextMenu = ({
  participant,
  chatKey,
  isOwner,
}: UseParticipantContextMenuParams) => {
  const { openMenu, activeMenuId } = useContextMenu();
  const openModal = useModalStore((s) => s.openModal);
  const router = useRouter();

  const menuId = `participant-${participant.uid}`;

  return {
    onContextMenu: (e: MouseEvent) => {
      e.preventDefault();
      const viewProfileItem = {
        label: "Посмотреть профиль",
        onClick: () => {
          router.push(`/chats/${chatKey}/participant/${participant.uid}/profile`);
        },
      };

      const ownerItems = [
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
        viewProfileItem,
      ];

      openMenu(menuId, isOwner ? ownerItems : [viewProfileItem], e.clientX, e.clientY);
    },
    isOpen: activeMenuId === menuId,
  };
};
