import { StatusIcon } from "@/entities/chat/ui/statusIcon";
import { cn } from "@/shared/shadcn/lib/utils";

import { SendingStatus } from "../model/types/serverTypes";

type MessageTimeAndStatusProps = {
  className?: string;
  isMine: boolean;
  time: string;
  status: SendingStatus;
  isEmpty?: boolean;
};

export const MessageTimeAndStatus: React.FC<MessageTimeAndStatusProps> = ({
  className,
  isMine,
  time,
  status,
  isEmpty,
}) => {
  return (
    <div
      className={cn(
        "minitext text-gray leading-subtext mt-auto flex items-center gap-0.5 select-none",
        isEmpty && "absolute right-2 bottom-2 rounded-full bg-[#00000066] px-1.5 py-0.5 text-white",
        className,
      )}
    >
      <span>{time}</span>
      {isMine && <StatusIcon status={status} className="h-2.5 w-3.5" isActive={isEmpty} />}
    </div>
  );
};
