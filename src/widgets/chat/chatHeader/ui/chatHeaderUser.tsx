import Image from "next/image";

import { ChatType } from "@/features/chat/chat/model/types/serverTypes";
import { cn } from "@/shared/shadcn/lib/utils";
import ChatPhoto from "@/shared/ui/icons/chat/header/chatPhoto.svg";
import ProfilePhoto from "@/shared/ui/icons/chat/header/profilePhoto.svg";
import { Statusbar } from "@/shared/ui/statusbar/ui/statusbar";

type Props = {
  name: string;
  wasOnlineAt?: number | null;
  isOnline?: boolean | null;
  membersCount?: number;
  chatType: ChatType;
  photo: string | null;
  isInfoHidden?: boolean;
};

export const ChatHeaderUser = ({
  name,
  photo,
  wasOnlineAt,
  isOnline,
  chatType,
  membersCount,
  isInfoHidden,
}: Props) => {
  return (
    <div className="border-light-gray desktop:border-none flex h-[60px] min-w-0 flex-1 items-center gap-3 border-b pr-3">
      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full">
        {photo ? (
          <Image src={photo} alt="profile" fill className="object-cover" />
        ) : chatType === "chat" ? (
          <ProfilePhoto className="text-primary h-10 w-10" />
        ) : (
          <ChatPhoto className="text-primary h-10 w-10" />
        )}
      </div>

      <button
        className={cn(
          "flex w-full min-w-0 cursor-pointer flex-col text-left",
          isInfoHidden && "hidden",
        )}
      >
        <p className="desktop:text-lg truncate text-sm leading-5 font-medium">{name}</p>
        <Statusbar
          time={wasOnlineAt || null}
          isOnline={isOnline || null}
          membersCount={membersCount}
          chatType={chatType}
        />
      </button>
    </div>
  );
};
