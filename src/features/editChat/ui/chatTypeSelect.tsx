"use client";

import { useEffect, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";

import { cn } from "@/shared/shadcn/lib/utils";

type Option = {
  value: 1 | 2;
  title: string;
  description: string;
};

const getOptions = (mode: "group" | "channel"): Option[] => [
  {
    value: 1,
    title: mode === "group" ? "Закрытая" : "Публичный",
    description:
      mode === "group"
        ? "В закрытую группу можно попасть только по приглашению или пригласительной ссылке"
        : "Публичный канал можно найти через поиск. Подписаться на него может любой пользователь",
  },
  {
    value: 2,
    title: mode === "group" ? "Открытая" : "Частный",
    description:
      mode === "group"
        ? "Открытую группу можно найти через поиск. Присоединиться к ней может любой пользователь"
        : "В частный канал можно попасть только по приглашению или пригласительной ссылке",
  },
];

type ChatTypeSelectProps = {
  mode: "group" | "channel";
};

export const ChatTypeSelect: React.FC<ChatTypeSelectProps> = ({ mode }) => {
  const { watch, setValue } = useFormContext();
  const currentValue = watch("chat_type");

  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const options = getOptions(mode);

  useEffect(() => {
    const onOutside = (e: MouseEvent) => {
      if (open && !rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [open]);

  const selected = options.find((o) => o.value === currentValue) || options[0];

  return (
    <div ref={rootRef} className="relative">
      <div className="text-gray mb-2 text-sm">{mode === "group" ? "Тип группы" : "Тип канала"}</div>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="desktop:flex hidden h-14 w-full items-center justify-between rounded-2xl bg-white px-5"
      >
        <span className="text-base">{selected.title}</span>
        <span className={cn("transition-transform", open && "rotate-180")}>
          <svg
            width="12"
            height="8"
            viewBox="0 0 12 8"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M1.41 7.41L6 2.83L10.59 7.41L12 6L6 0L0 6L1.41 7.41Z" fill="#747474" />
          </svg>
        </span>
      </button>

      <div className={cn("mt-2 flex-col rounded-2xl", open ? "flex" : "desktop:hidden flex")}>
        {options.map((opt, index) => {
          const checked = opt.value === currentValue;

          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                setValue("chat_type", opt.value, { shouldValidate: true });
                setOpen(false);
              }}
              className={cn(
                "hover:bg-primary-gray smooth desktop:bg-white bg-main-light-gray flex w-full items-center gap-4 px-4 text-left",
                index === 0 ? "rounded-t-2xl pt-2 pb-1.5" : "rounded-b-2xl pt-1.5 pb-2",
              )}
            >
              <span
                className={cn(
                  "mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                  checked ? "border-primary border-2" : "border-muted border",
                )}
              >
                {checked && <span className="bg-primary h-3 w-3 rounded-full" />}
              </span>

              <span className="flex flex-col">
                <span className="text-base">{opt.title}</span>
                <span className="text-gray text-sm leading-snug">{opt.description}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
