import { cn } from "@/shared/shadcn/lib/utils";
import { Button } from "@/shared/shadcn/ui/button";

type InviteToChatBtnProps = {
  className?: string;
  disabled?: boolean;
  isLoading?: boolean;
  onClick?: () => void;
};

export const InviteToChatBtn: React.FC<InviteToChatBtnProps> = ({
  className,
  disabled,
  isLoading,
  onClick,
}) => {
  return (
    <Button className={cn("", className)} disabled={disabled || isLoading} onClick={onClick}>
      {isLoading ? "Добавление..." : "Добавить"}
    </Button>
  );
};
