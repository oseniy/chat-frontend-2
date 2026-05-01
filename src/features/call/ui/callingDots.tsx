import { cn } from "@/shared/shadcn/lib/utils";

type CallingDotsProps = {
  className?: string;
};

export const CallingDots: React.FC<CallingDotsProps> = ({ className }) => {
  return (
    <span className={cn("ml-1 flex items-end gap-0.75", className)} aria-hidden>
      <span className="block h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
      <span
        className="block h-1.5 w-1.5 animate-pulse rounded-full bg-current"
        style={{ animationDelay: "150ms" }}
      />
      <span
        className="block h-1.5 w-1.5 animate-pulse rounded-full bg-current"
        style={{ animationDelay: "300ms" }}
      />
    </span>
  );
};
