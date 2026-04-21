import { cn } from "@/shared/shadcn/lib/utils";

type ChatBadgeProps = {
  className?: string;
  label: string;
};

export const ChatBadge: React.FC<ChatBadgeProps> = ({ label, className }) => {
  return (
    <div
      className={cn(
        "caption flex w-fit justify-center self-center rounded-md bg-[#615AA399] px-2 py-0.5 font-medium text-white",
        className,
      )}
    >
      <span>{label}</span>
    </div>
  );
};
