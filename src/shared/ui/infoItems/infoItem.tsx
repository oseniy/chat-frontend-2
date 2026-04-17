"use client";

import { cn } from "@/shared/shadcn/lib/utils";

import { CopyBtn } from "../../copy/ui/copyBtn";

type InfoItemProps = {
  className?: string;
  title?: string;
  text?: string;
  textToCopy?: string;
  copy?: boolean;
};

export const InfoItem: React.FC<InfoItemProps> = ({
  className,
  text,
  title,
  textToCopy = text,
  copy = false,
}) => {
  return (
    <div className="border-muted flex w-full cursor-default gap-2 overflow-hidden border-b px-3 py-2 last:border-0">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {title && <p className="text-gray caption">{title}</p>}
        {text && (
          <div className={cn("flex min-w-0 items-center gap-2")}>
            <p className={cn(copy ? "subtext truncate" : "subtext wrap-anywhere", className)}>
              {text}
            </p>
          </div>
        )}
      </div>
      {copy && <CopyBtn text={textToCopy} className="shrink-0 self-center" />}
    </div>
  );
};
