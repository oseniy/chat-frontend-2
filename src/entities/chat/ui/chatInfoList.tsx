"use client";

import { cn } from "@/shared/shadcn/lib/utils";
import { InfoItem } from "@/shared/ui/infoItems/infoItem";
import { useInviteLink } from "@/widgets/anothersProfile/lib/useInviteLink";

import { MappedChatDetails } from "../lib/mapChat";

type ChatInfoListProps = {
  className?: string;
  initialData: MappedChatDetails | null;
  isOwner: boolean;
};

export const ChatInfoList = ({ className, initialData, isOwner }: ChatInfoListProps) => {
  const description = initialData?.description;

  const { data, isLoading, isError } = useInviteLink(isOwner ? initialData?.chatKey : undefined);

  const fullInviteLink = (() => {
    if (!data?.invite_link) return undefined;
    const tokenMatch = data.invite_link.match(/[?&]token=([^\s&]+)/);
    const token = tokenMatch?.[1];
    if (!token || !data.chat_key) return data.invite_link;
    return `${process.env.NEXT_PUBLIC_APP_URL}/chats/${data.chat_key}?token=${token}`;
  })();

  const inviteLink = isLoading
    ? "..."
    : isError
      ? "Ошибка генерации пригласительной ссылки"
      : fullInviteLink;

  const hasInviteLink = !!fullInviteLink;

  return (
    <div className="flex w-full flex-col gap-2">
      <div className={cn("flex w-full flex-col rounded-lg bg-white", className)}>
        {description && description.trim() !== "" && (
          <InfoItem title="Описание" text={description} className="text-black" />
        )}
      </div>
      {isOwner && (
        <div className={cn("flex w-full flex-col rounded-lg bg-white", className)}>
          <InfoItem
            copy
            title="Ссылка на приглашение в группу"
            text={inviteLink}
            className={cn(hasInviteLink ? "text-primary" : "text-black")}
          />
        </div>
      )}
    </div>
  );
};
