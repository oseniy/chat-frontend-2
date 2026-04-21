import { cn } from "@/shared/shadcn/lib/utils";

type VisualBubbleProps = {
  isMine: boolean;
  children: React.ReactNode;
  isFirst?: boolean;
};

export const MessageVisualBubble = ({ isMine, children, isFirst }: VisualBubbleProps) => {
  return (
    <div
      className={cn(
        "relative w-fit max-w-[83%] overflow-hidden rounded-2xl",
        isMine ? "bg-light-green rounded-br-sm" : "rounded-bl-sm bg-white",
        !isFirst && "mt-1",
      )}
    >
      {children}
    </div>
  );
};
