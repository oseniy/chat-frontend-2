"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";

import { removeMembersFromChat } from "@/entities/chat/api/removeMembersFromChat";
import { useParticipantsStore } from "@/entities/chat/model/useParticipantsStore";
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
  const removeParticipants = useParticipantsStore((s) => s.removeParticipants);
  const closeModal = useModalStore((s) => s.closeModal);
  const { showToast } = useToast();

  const confirmRemove = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await removeMembersFromChat(chatKey, [participantUid]);

      if (response.status === "OK") {
        closeModal();
        showToast(`${participantName} удалён из группы`, {
          mobile: "/icons/toast/checkMobile.svg",
          desktop: "/icons/toast/checkDesktop.svg",
        });
        removeParticipants([participantUid]);
        queryClient.invalidateQueries({ queryKey: ["participants", chatKey] });
      }
    } catch (error) {
      console.error("Ошибка при удалении участника:", error);
    } finally {
      setIsLoading(false);
    }
  }, [
    chatKey,
    participantUid,
    participantName,
    closeModal,
    showToast,
    removeParticipants,
    queryClient,
  ]);

  return { isLoading, confirmRemove };
};
