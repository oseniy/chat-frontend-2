import Image from "next/image";

import { cn } from "@/shared/shadcn/lib/utils";

type AvatarProps = {
  className?: string;
  isOnline?: boolean;
  avatarUrl?: string | null;
  size?:
    | "xs"
    | "s"
    | "sm"
    | "md"
    | "lg"
    | "xl"
    | "settingsAvatar"
    | "createGroupAvatar"
    | "anothersProfileAvatar";
  variant?: "user" | "chat";
};

const AVATAR_SIZES = {
  xs: "w-4.5 h-4.5",
  s: "w-8 h-8",
  sm: "w-10 h-10",
  md: "w-15 h-15",
  lg: "w-20.5 h-20.5",
  xl: "w-50 h-50",
  settingsAvatar:
    "max-h-[390px] h-[390px] w-full desktop:w-50 desktop:max-h-50 desktop:h-50 object-cover rounded-md desktop:rounded-full",
  createGroupAvatar:
    "h-[88px] max-h-[88px] desktop:w-50 desktop:max-h-50 desktop:h-50 rounded-full",
  anothersProfileAvatar:
    "max-h-[360px] w-full object-cover rounded-md desktop:rounded-none after:absolute after:right-0 after:bottom-0 after:left-0 after:h-1/3 after:bg-linear-to-t after:from-black/70 after:via-black/30 after:to-transparent",
};

export const Avatar = ({
  isOnline,
  avatarUrl,
  size = "md",
  className,
  variant = "user",
}: AvatarProps) => {
  const avatarSrc = avatarUrl || (variant == "user" ? "/chat/avatar.svg" : "/chat/avatarGroup.svg");
  return (
    <div className={cn("relative shrink-0", className)}>
      <div className={cn("relative overflow-hidden rounded-full", AVATAR_SIZES[size])}>
        <Image
          src={avatarSrc}
          width={200}
          height={200}
          alt="аватар"
          priority={size === "settingsAvatar"}
          className={cn("h-full w-full object-cover", size === "createGroupAvatar" && "scale-140")}
        />
      </div>
      {isOnline && (
        <div className="absolute right-0.5 bottom-0.5 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
      )}
    </div>
  );
};
