"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { getChatPreview } from "@/entities/chat/api/getChatPreview";
import { useModalStore } from "@/entities/modals/model/useGlobalModalStore";
import { useIsMobileStore } from "@/shared/model/isMobile.store";
import { useToast } from "@/shared/toast/ui/toastProvider";

type Props = { chatKey: string; token: string };

export const ChatInviteJoinView = ({ chatKey, token }: Props) => {
  const openModal = useModalStore((s) => s.openModal);
  const { showToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchPreview = async () => {
      const previewResult = await getChatPreview(token);
      const isMobile = useIsMobileStore.getState().isMobile;

      if (!previewResult.success) {
        showToast("Срок действия ссылки истек", {
          mobile: "/icons/toast/block.svg",
          desktop: "/icons/toast/block.svg",
        });
        if (isMobile) {
          router.replace("/chats");
        }
      } else {
        openModal("chatPreview", { chatKey, token, previewData: previewResult.data });
        if (isMobile) {
          router.replace("/chats");
        }
      }
    };

    fetchPreview();
  }, [token, chatKey, openModal, showToast, router]);

  return (
    <div className="desktop:flex text-gray hidden h-full w-full items-center justify-center">
      Выберите контакт для общения
    </div>
  );
};
