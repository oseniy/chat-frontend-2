"use client";

import Image from "next/image";

import { cn } from "@/shared/shadcn/lib/utils";
import ProfilePhoto from "@/shared/ui/icons/chat/header/profilePhoto.svg";

type Props = {
  name: string;
  avatarUrl?: string | null;
  size?: "sm" | "lg";
  className?: string;
};

export const CallAvatar = ({ name, avatarUrl, size = "lg", className }: Props) => {
  const dimension = size === "lg" ? 132 : 56;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-full bg-white/10",
        size === "lg" ? "h-32 w-32" : "h-14 w-14",
        className,
      )}
      style={{ width: dimension, height: dimension }}
    >
      {avatarUrl ? (
        <Image src={avatarUrl} alt={name} fill sizes={`${dimension}px`} className="object-cover" />
      ) : (
        <ProfilePhoto className="h-full w-full text-white/80" />
      )}
    </div>
  );
};
