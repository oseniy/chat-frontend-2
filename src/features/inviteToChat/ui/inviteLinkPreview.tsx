"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { getChatPreview } from "@/entities/chat/api/getChatPreview";
import { Avatar } from "@/entities/chat/ui/avatar";
import { handleInviteLinkClick } from "@/features/chat/chat/lib/handleInviteLinkClick";
import { pluralize } from "@/shared/lib/pluralize";
import { useToast } from "@/shared/toast/ui/toastProvider";

type InviteLinkPreviewProps = {
  chatKey: string;
  token: string;
};

export const InviteLinkPreview = ({ chatKey, token }: InviteLinkPreviewProps) => {
  const router = useRouter();
  const { showToast } = useToast();
  const { data, isError } = useQuery({
    queryKey: ["chatPreview", token],
    queryFn: async () => {
      const response = await getChatPreview(token);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  if (isError) return null;

  if (!data) return null;

  const isChannel = chatKey.startsWith("channel");
  const subtitle =
    data.description ||
    (isChannel
      ? `${data.participantsCount - 1} ${pluralize(data.participantsCount - 1, "подписчик", "подписчика", "подписчиков")}`
      : `${data.participantsCount} ${pluralize(data.participantsCount, "участник", "участника", "участников")}`);

  return (
    <div className="mx-3 mt-1.5 min-w-0">
      <div
        className="min-w-0 cursor-pointer overflow-hidden"
        onClick={() =>
          handleInviteLinkClick({
            url: `/chats/${chatKey}?token=${token}`,
            router: router,
            showToast: showToast,
          })
        }
      >
        <div className="border-primary flex min-w-0 items-start gap-1 overflow-hidden rounded border-l-4 bg-white/50 p-1 px-2.5">
          <Avatar avatarUrl={data.avatarUrl} size="sm" variant="chat" />
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="text-primary truncate text-sm leading-[130%] font-bold">
              {data.name}
            </span>
            <span className="text-gray line-clamp-4 text-base leading-[130%] break-all">
              {subtitle}
            </span>
            <span className="text-primary text-base leading-[120%] font-medium uppercase">
              {isChannel ? "Перейти в канал" : "Перейти в группу"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
