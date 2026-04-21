"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";

import { makeAdmin } from "@/entities/chat/api/ws/makeAdmin";
import { ChatTypeLight } from "@/entities/chat/model/types";
import { useChatInfoStore } from "@/entities/chat/model/useChatInfoStore";
import { useChatStore } from "@/entities/chat/model/useChatStore";
import { useModalStore } from "@/entities/modals/model/useGlobalModalStore";
import { useUserStore } from "@/entities/user/model/userStore";
import { useUserInfoStore } from "@/entities/user/model/useUserInfoStore";
import { useToast } from "@/shared/toast/ui/toastProvider";

type UseMakeAdminParams = {
  chatKey: string;
  participantUid: string;
  participantName: string;
  chatType: ChatTypeLight;
};

export const useMakeAdmin = ({
  chatKey,
  participantUid,
  participantName,
  chatType,
}: UseMakeAdminParams) => {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const closeModal = useModalStore((s) => s.closeModal);
  const currentUserUid = useUserStore((s) => s.userId);
  const currentUserInfo = useUserInfoStore((s) =>
    currentUserUid ? s.userInfoByUid[currentUserUid] : undefined,
  );
  const { showToast } = useToast();

  const confirm = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await makeAdmin(chatKey, participantUid);

      if (response.status === "OK") {
        closeModal();
        showToast(
          `${participantName} теперь владелец ${chatType == "channel" ? "канала" : "группы"}`,
          {
            mobile: "/icons/toast/checkMobile.svg",
            desktop: "/icons/toast/checkDesktop.svg",
          },
        );
        const currentInfo = useChatInfoStore.getState().chatInfoByKey[chatKey];
        if (currentInfo && currentUserUid) {
          const newMembers = currentInfo.members
            .filter((m) => m.uid !== participantUid)
            .concat({ uid: currentUserUid, name: currentUserInfo?.fullName ?? "" });
          useChatInfoStore
            .getState()
            .patchChatInfo(chatKey, { createdBy: participantUid, members: newMembers });
          useChatStore.setState({ createdBy: participantUid });
        }
        queryClient.invalidateQueries({ queryKey: ["participants", chatKey] });
      }
    } catch (error) {
      console.error("Ошибка при передаче прав владельца:", error);
    } finally {
      setIsLoading(false);
    }
  }, [
    chatKey,
    participantUid,
    participantName,
    closeModal,
    showToast,
    queryClient,
    currentUserUid,
    currentUserInfo,
  ]);

  return { isLoading, confirm };
};
