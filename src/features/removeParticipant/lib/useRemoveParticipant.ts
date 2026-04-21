"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";

import { removeMembersFromChat } from "@/entities/chat/api/removeMembersFromChat";
import { removeParticipantsFromCache } from "@/entities/chat/lib/participantsCache";
import { useModalStore } from "@/entities/modals/model/useGlobalModalStore";
import { useToast } from "@/shared/toast/ui/toastProvider";

type UseRemoveParticipantParams = {
  chatKey: string;
  participantUid: string;
  participantName: string;
};

export const useRemoveParticipant = ({
  chatKey,
  participantUid,
  participantName,
}: UseRemoveParticipantParams) => {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const closeModal = useModalStore((s) => s.closeModal);
  const { showToast } = useToast();

  const confirmRemove = useCallback(async () => {
    setIsLoading(true);
    removeParticipantsFromCache(chatKey, [participantUid]);
    try {
      const response = await removeMembersFromChat(chatKey, [participantUid]);

      if (response.status === "OK") {
        closeModal();
        showToast(`${participantName} удалён из группы`, {
          mobile: "/icons/toast/checkMobile.svg",
          desktop: "/icons/toast/checkDesktop.svg",
        });
        queryClient.invalidateQueries({ queryKey: ["participants", chatKey] });
      } else {
        queryClient.invalidateQueries({ queryKey: ["participants", chatKey] });
      }
    } catch (error) {
      console.error("Ошибка при удалении участника:", error);
      queryClient.invalidateQueries({ queryKey: ["participants", chatKey] });
    } finally {
      setIsLoading(false);
    }
  }, [chatKey, participantUid, participantName, closeModal, showToast, queryClient]);

  return { isLoading, confirmRemove };
};
