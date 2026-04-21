"use client";
import Close from "@icons/close.svg";
import BackArrow from "@icons/menu/back-arrow.svg";
import More from "@icons/more.svg";
import Settings from "@icons/navBar/desktop/settings.svg";
import { useRouter } from "next/navigation";
import { MouseEvent } from "react";

import { cn } from "@/shared/shadcn/lib/utils";
import { Button } from "@/shared/shadcn/ui/button";

type SidebarHeaderProps = {
  className?: string;
  title: string;
  backButton?: boolean;
  closeButton?: boolean;
  settings?: boolean;
  backButtonFn?: () => void;
  closeButtonFn?: () => void;
  contextMenu?: { onContextMenu: (e: MouseEvent) => void; isOpen: boolean };
  onSettingsClick?: () => void;
};

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({
  className,
  title,
  backButton,
  settings,
  backButtonFn,
  closeButton,
  closeButtonFn,
  contextMenu,
  onSettingsClick,
}) => {
  const router = useRouter();
  const onBackClick = backButtonFn || (() => router.back());
  const onCloseClick = closeButtonFn || (() => router.back());

  return (
    <div
      className={cn(
        "border-muted desktop:border-b relative flex h-14 w-full items-center p-5",
        backButton || closeButton ? "justify-between" : "justify-center",
        className,
      )}
    >
      <div className="flex">
        {backButton && (
          <Button variant="ghost" size="icon-auto" className="z-10 h-6 w-6" onClick={onBackClick}>
            <BackArrow className="text-black" />
          </Button>
        )}

        {closeButton && (
          <Button variant="ghost" size="icon-auto" className="z-10" onClick={onCloseClick}>
            <Close className="text-primary h-4 w-4" />
          </Button>
        )}

        <h2
          className={cn(
            "text font-semibold transition-all",
            "absolute left-1/2 w-max -translate-x-1/2",
            "desktop:static desktop:left-auto desktop:translate-x-0",
            backButton || closeButton ? "desktop:ml-3" : "desktop:w-full desktop:text-center",
          )}
        >
          {title}
        </h2>
      </div>
      {contextMenu && (
        <div className="flex gap-2">
          {settings && (
            <Button variant="ghost" size="icon-auto" onClick={onSettingsClick}>
              <Settings className="text-primary h-6 w-6" />
            </Button>
          )}
          <Button variant="ghost" size="icon-auto" onClick={contextMenu.onContextMenu}>
            <More className="text-primary h-6 w-6" />
          </Button>
        </div>
      )}
    </div>
  );
};
