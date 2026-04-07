import { useRouter } from "next/navigation";
import { useState } from "react";

import { joinByInvite } from "@/entities/chat/api/ws/joinByInvite";
import { selfJoinChat } from "@/entities/chat/api/ws/selfJoinChat";
import { ChatType } from "@/entities/chat/model/types";
import { useChatListStore } from "@/features/chatList/model/useChatListStore";
import { useToast } from "@/shared/toast/ui/toastProvider";

type Params = {
  chatKey?: string | undefined;
  token?: string | undefined;
  closeModal?: () => void;
  chatType?: ChatType;
};

export const useJoinToChat = ({
  chatKey = undefined,
  token = undefined,
  closeModal,
  chatType,
}: Params) => {
  const router = useRouter();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const onJoin = !chatKey
    ? () => {}
    : async () => {
        try {
          setIsLoading(true);
          if (token) {
            await joinByInvite(chatKey, token);
          } else if (chatType === "public-group" || chatType === "public-channel") {
            await selfJoinChat(chatKey);
          } else {
            showToast("Ошибка присоединения к чату", {
              mobile: "/icons/toast/block.svg",
              desktop: "/icons/toast/block.svg",
            });
            setIsLoading(false);
            return;
          }
          if (closeModal) closeModal();
          await useChatListStore.getState().addNewChat(chatKey);
          router.push(`/chats/${chatKey}`);
          router.refresh();
        } catch {
          setIsLoading(false);
          showToast("Срок действия ссылки истек", {
            mobile: "/icons/toast/block.svg",
            desktop: "/icons/toast/block.svg",
          });
        }
      };

  return { onJoin, isLoading, setIsLoading };
};
