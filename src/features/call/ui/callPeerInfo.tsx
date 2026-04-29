"use client";

import Image from "next/image";

import { cn } from "@/shared/shadcn/lib/utils";
import ProfilePhoto from "@/shared/ui/icons/chat/header/profilePhoto.svg";

import { formatDuration } from "../lib/formatDuration";
import { CallingDots } from "./callingDots";

type Variant = "dark" | "light";

type Props = {
  name: string;
  avatarUrl?: string | null;
  statusText?: string;
  showDots?: boolean;
  showTimer?: boolean;
  duration?: number;
  variant?: Variant;
  className?: string;
};

export const CallPeerInfo = ({
  name,
  avatarUrl,
  statusText,
  showDots = false,
  showTimer = false,
  duration = 0,
  variant = "dark",
  className,
}: Props) => {
  const isLight = variant === "light";
  const textColor = isLight ? "text-black" : "text-white";

  return (
    <div className={cn("flex flex-1 flex-col items-center justify-center gap-11 px-4", className)}>
      <div
        className={cn(
          "flex h-40 w-40 shrink-0 items-center justify-center rounded-full p-3",
          isLight ? "bg-primary-light/30" : "bg-primary-third",
        )}
      >
        <div
          className={cn(
            "relative h-full w-full overflow-hidden rounded-full",
            isLight ? "bg-black/5" : "bg-white/10",
          )}
        >
          {avatarUrl ? (
            <Image src={avatarUrl} alt={name} fill sizes="136px" className="object-cover" />
          ) : (
            <ProfilePhoto
              className={cn("h-full w-full", isLight ? "text-black/40" : "text-white/80")}
            />
          )}
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 px-4">
        <h2 className={cn("text-center text-2xl font-medium tracking-[0.01em]", textColor)}>
          {name}
        </h2>
        <div
          className={cn("flex items-center justify-center gap-0.5 text-base", textColor)}
          aria-live="polite"
        >
          {showTimer ? (
            <span>{formatDuration(duration)}</span>
          ) : (
            <>
              {statusText && <span>{statusText}</span>}
              {showDots && <CallingDots />}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
