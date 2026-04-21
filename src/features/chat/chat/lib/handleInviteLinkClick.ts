import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

import { getChat } from "@/entities/chat/api/getChat";
import { getChatPreview } from "@/entities/chat/api/getChatPreview";
import { getChatTypeLight } from "@/entities/chat/lib/getChatTypeLight";
import { parseInviteUrl } from "@/entities/chat/lib/parseInviteUrl";
import { useModalStore } from "@/entities/modals/model/useGlobalModalStore";

type Params = {
  url: string;
  router: AppRouterInstance;
  showToast: (
    message: string,
    icon: {
      mobile: string;
      desktop?: string | undefined;
    },
  ) => void;
};

export const handleInviteLinkClick = async ({ url, router, showToast }: Params) => {
  const inviteData = parseInviteUrl(url);
  if (!inviteData) return null;

  const { chatKey, token } = inviteData;

  const previewResult = await getChatPreview(token);
  if (!previewResult.success) {
    showToast("Срок действия ссылки истек", {
      mobile: "/icons/toast/block.svg",
      desktop: "/icons/toast/block.svg",
    });
    return null;
  }

  const chatType = getChatTypeLight(chatKey);
  const chatResult = await getChat(chatKey, chatType);

  if (!chatResult.success) {
    useModalStore
      .getState()
      .openModal("chatPreview", { chatKey, previewData: previewResult.data, token: token });
    return;
  }

  router.push(`/chats/${chatKey}?token=${token}`);
};
