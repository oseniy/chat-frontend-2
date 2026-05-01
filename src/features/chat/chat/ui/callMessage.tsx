import { getCallTitle } from "@/entities/chat/lib/getCallTitle";
import { cn } from "@/shared/shadcn/lib/utils";
import CallIcon from "@/shared/ui/icons/chat/call.svg";

import { CallBlock } from "../model/messageBlock/types";
import { SendingStatus } from "../model/types/serverTypes";
import { MessageTimeAndStatus } from "./messageTimeAndStatus";

type CallMessageProps = {
  block: CallBlock;
  isMine: boolean;
  time: string;
  status: SendingStatus;
};

const formatDuration = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const getIconColor = (status: CallBlock["status"], isMine: boolean) => {
  if (status === "completed") return "text-primary";
  if (!isMine && (status === "unreceived" || status === "failed")) return "text-error";
  return "text-gray";
};

export const CallMessage = ({ block, isMine, time, status }: CallMessageProps) => {
  const hasDuration = block.status === "completed" && typeof block.duration === "number";
  const title = getCallTitle(block.status, isMine);
  const iconColor = getIconColor(block.status, isMine);

  return (
    <div className="flex items-center gap-3 px-3 py-2.5">
      <div
        className={cn(
          "desktop:bg-white bg-primary-accent-light flex h-12 w-12 shrink-0 items-center justify-center rounded-full",
          isMine && "bg-white",
        )}
      >
        <CallIcon className={`h-6 w-6 ${iconColor}`} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="subtext truncate text-black">{title}</span>
        <div className="flex items-center justify-between gap-3">
          <span className="text-gray minitext leading-4">
            {hasDuration ? formatDuration(block.duration as number) : ""}
          </span>
          <MessageTimeAndStatus isMine={isMine} time={time} status={status} />
        </div>
      </div>
    </div>
  );
};
