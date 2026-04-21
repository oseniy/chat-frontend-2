import ArrowDown from "@icons/chat/arrowDown.svg";
import Close from "@icons/chat/close.svg";

import { cn } from "@/shared/shadcn/lib/utils";
import { Button } from "@/shared/shadcn/ui/button";
import { Searchbar } from "@/shared/ui/searchbar";

type SearchbarMessagesProps = {
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
  disablePrev: boolean;
  disableNext: boolean;
  isSearchOpen?: boolean;
  onPageChange?: (page: number) => void;
  onClose?: () => void;
};

export const SearchbarMessages: React.FC<SearchbarMessagesProps> = ({
  className,
  value,
  onChange,
  onPageChange,
  disablePrev,
  disableNext,
  isSearchOpen,
  onClose,
}) => {
  return (
    <div className={cn("relative flex items-center", className)}>
      <Searchbar
        className={"w-full"}
        onChange={onChange}
        value={value}
        isSearchOpen={isSearchOpen}
      />
      <div className="absolute right-4 flex items-center gap-6">
        {value && (
          <div className="flex items-center gap-5">
            <Button
              variant={"text"}
              size={"icon"}
              disabled={disablePrev}
              className={cn("h-5 w-5")}
              onClick={() => onPageChange?.(-1)}
            >
              <ArrowDown
                className={cn("h-full w-full", disablePrev && "bg-transparent opacity-50")}
              />
            </Button>
            <Button
              variant={"text"}
              size={"icon"}
              disabled={disableNext}
              className={cn("h-5 w-5")}
              onClick={() => onPageChange?.(1)}
            >
              <ArrowDown
                className={cn(
                  "h-full w-full rotate-180",
                  disableNext && "bg-transparent opacity-50",
                )}
              />
            </Button>
          </div>
        )}
        <Button variant={"text"} size={"icon"} className="h-4 w-4" onClick={onClose}>
          <Close className="h-full w-full" />
        </Button>
      </div>
    </div>
  );
};
