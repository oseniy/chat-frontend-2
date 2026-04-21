import Image from "next/image";
import { useEffect } from "react";

import { cn } from "@/shared/shadcn/lib/utils";

type ToastProps = {
  message?: string;
  className?: string;
  duration?: number;
  onClose: () => void;
  iconColor?: string;
  icon: {
    mobile: string;
    desktop?: string;
  };
};

export const Toast = ({
  message = "Новый код отправлен",
  duration = 3000,
  className,
  onClose,
  icon,
  iconColor,
}: ToastProps) => {
  useEffect(() => {
    let active = true;

    const timer = setTimeout(() => {
      if (active) onClose();
    }, duration);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [duration, onClose]);

  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={cn(
        "desktop:top-auto animate-in fade-in slide-in-from-bottom-2 desktop:bottom-0 desktop:left-1/2 desktop:mb-6 desktop:max-w-90 desktop:-translate-x-1/2 pointer-events-none absolute top-3 left-1/2 w-90 -translate-x-1/2 transform rounded-md bg-[rgba(0,0,0,0.6)] p-3 text-white duration-200",
        className,
      )}
    >
      <div className="flex items-center">
        <Image
          src={icon.mobile}
          width={16}
          height={16}
          alt=""
          aria-hidden
          className={cn("block md:hidden", iconColor ? `fill-${iconColor}` : "")}
        />
        <Image
          src={icon.desktop ?? icon.mobile}
          width={20}
          height={20}
          alt=""
          aria-hidden
          className="hidden md:block"
        />
        <p className="ml-3">{message}</p>
      </div>
    </div>
  );
};
