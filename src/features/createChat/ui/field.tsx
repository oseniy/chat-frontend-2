import { useEffect, useRef } from "react";
import { useController, useFormContext } from "react-hook-form";

import { resizeTextarea } from "@/shared/form/lib/resizeTextarea";
import { cn } from "@/shared/shadcn/lib/utils";
import { Button } from "@/shared/shadcn/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@/shared/shadcn/ui/input-group";
import CloseCircle from "@/shared/ui/icons/closeCircle.svg";

type FieldProps = {
  name: string;
  title: string;
  maxLength: number;
  position: "upper" | "lower";
  className?: string;
};

export const Field = ({ name, title, maxLength, position, className }: FieldProps) => {
  const { control } = useFormContext();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    field: { value = "", onChange },
  } = useController({ name, control });

  const length = value.length;
  const isLimitReached = length >= maxLength;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    let nextValue = e.target.value;

    if (nextValue.length > maxLength) return;

    nextValue = nextValue.replace(/^\s+/, "");

    nextValue = nextValue.replace(/\s{2,}/g, " ");

    if (nextValue.endsWith(" ")) {
      const withoutLast = nextValue.slice(0, -1);
      if (withoutLast.endsWith(" ")) {
        nextValue = withoutLast;
      }
    }

    onChange(nextValue);
  };

  const handleBlur = () => {
    if (!value) return;

    // убираем пробелы в конце (и заодно в начале, на всякий)
    const trimmed = value.trim();

    if (trimmed !== value) {
      onChange(trimmed);
    }
  };

  useEffect(() => {
    resizeTextarea(textareaRef.current);
  }, [value]);

  const clear = () => {
    onChange("");
    textareaRef.current?.focus();
  };

  return (
    <InputGroup
      className={cn(
        position === "upper"
          ? "rounded-t-lg rounded-b-none border-b"
          : "rounded-t-none rounded-b-lg border-t",
        "group border-muted desktop:bg-white bg-main-light-gray relative flex h-min w-full",
        className,
      )}
    >
      <div className="relative flex w-full flex-1 overflow-hidden">
        <InputGroupTextarea
          ref={textareaRef}
          placeholder=" "
          rows={1}
          value={value}
          onBlur={handleBlur}
          onChange={handleChange}
          className="subtext z-10 h-14 min-h-14 resize-none overflow-hidden p-0 pt-6 pr-9 pl-3"
        />
      </div>

      {/* Label */}
      <InputGroupAddon
        align="absolute"
        className="smooth top-1/2 w-full -translate-y-1/2 transform justify-between p-0 px-3 py-2 font-normal group-focus-within:top-0 group-focus-within:left-0 group-focus-within:translate-y-0 group-[&:has(textarea:not(:placeholder-shown))]:top-0 group-[&:has(textarea:not(:placeholder-shown))]:left-0 group-[&:has(textarea:not(:placeholder-shown))]:translate-y-0"
      >
        <InputGroupText className="text-gray subtext group-focus-within:caption group-[&:has(textarea:not(:placeholder-shown))]:caption smooth">
          {title}
        </InputGroupText>
      </InputGroupAddon>

      {/* Counter */}
      <InputGroupAddon
        align="absolute"
        className="smooth top-0 right-0 px-3 py-2 opacity-0 group-focus-within:opacity-100"
      >
        <InputGroupText
          className={cn("caption smooth", isLimitReached ? "text-error" : "text-gray")}
        >
          {length}/{maxLength}
        </InputGroupText>
      </InputGroupAddon>

      {/* Clear */}
      <InputGroupAddon
        align="absolute"
        className="smooth top-5 right-3 z-10 opacity-0 group-focus-within:opacity-100"
      >
        <Button variant="ghost" size="icon-auto" type="button" onClick={clear}>
          <CloseCircle className="h-4 w-4" />
        </Button>
      </InputGroupAddon>
    </InputGroup>
  );
};
