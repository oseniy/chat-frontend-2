import CloseIcon from "@icons/chat/close.svg";
import SearchIcon from "@icons/chat/search.svg";
import { useEffect, useRef } from "react";

import { cn } from "@/shared/shadcn/lib/utils";
import { Button } from "@/shared/shadcn/ui/button";
import { Input } from "@/shared/shadcn/ui/input";

type SearchbarProps = {
  className?: string;
  onChange?: (value: string) => void;
  isSearchOpen?: boolean;
  value?: string;
  isFocused?: boolean;
};

export const Searchbar: React.FC<SearchbarProps> = ({
  className,
  onChange,
  value,
  isSearchOpen,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const onSearchChange = (value: string) => {
    if (onChange) onChange(value);
  };

  useEffect(() => {
    if (isSearchOpen) inputRef.current?.focus();
  }, [isSearchOpen]);

  const onClose = () => {
    onSearchChange("");
    inputRef.current?.focus();
  };

  return (
    <div className={cn("", className)}>
      <div className="relative flex-1">
        <Input
          ref={inputRef}
          placeholder="Поиск"
          className="placeholder:text-gray placeholder:subtext border-gray-tone subtext h-auto w-full p-11 py-3 leading-none font-normal placeholder:font-normal"
          value={value}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <SearchIcon className="text-gray absolute top-1/2 left-4 h-4.5 w-4.5 -translate-y-1/2" />
        {value && (
          <Button
            variant={"text"}
            size={"inline"}
            className="absolute top-1/2 right-4 -translate-y-1/2"
            onClick={onClose}
          >
            <CloseIcon className="text-gray hover:text-primary h-3.5 w-3.5 transition-colors duration-200" />
          </Button>
        )}
      </div>
    </div>
  );
};
