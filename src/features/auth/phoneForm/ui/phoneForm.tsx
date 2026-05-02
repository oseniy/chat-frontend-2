"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { ModalDialog } from "@/shared/modalDialog/ui/modalDialog";
import { cn } from "@/shared/shadcn/lib/utils";
import {
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/shadcn/ui/alert-dialog";
import { Button } from "@/shared/shadcn/ui/button";

import { useFlashCall } from "../lib/useFlashCall";
import { PhoneData, phoneSchema } from "../model/schema";
import { usePhoneStore } from "../model/store";
import { PhoneInput } from "./phoneInput";

export const PhoneForm = ({ className }: { className?: string }) => {
  const setPhone = usePhoneStore((state) => state.setPhone);
  const { start, stage, error, callNumber } = useFlashCall();
  const [openModal, setOpenModal] = useState(false);
  const [pendingPhone, setPendingPhone] = useState(""); // Исправлено: добавили переменную
  const router = useRouter();

  const {
    handleSubmit,
    control,
    getValues,
    formState: { isValid },
  } = useForm<PhoneData>({
    resolver: zodResolver(phoneSchema),
    mode: "onChange",
    defaultValues: { phone: "" },
  });

  const onSubmit = useCallback(
    async (data: PhoneData) => {
      setOpenModal(false);
      setPhone(data.phone);
      setPendingPhone(data.phone);
      await start(data.phone.replaceAll(" ", ""));
    },
    [setPhone, start],
  );

  // СЛУШАЕМ ENTER ДЛЯ МОДАЛКИ (Правка тестера)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (openModal && e.key === "Enter") {
        e.preventDefault();
        handleSubmit(onSubmit)();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [openModal, handleSubmit, onSubmit]);

  if (stage === "calling" || stage === "success") {
    return (
      <div className={cn("flex flex-col items-center gap-6 py-10 text-center", className)}>
        <div className="flex flex-col items-center gap-2">
          <div className="border-primary mb-2 h-10 w-10 animate-spin rounded-full border-4 border-t-transparent" />
          <h3 className="text-lg font-semibold text-black">Авторизация по звонку</h3>
        </div>

        <div className="flex w-full flex-col gap-4">
          <p className="text-sm text-gray-500">
            Для подтверждения номера{" "}
            <span className="font-semibold text-black">{pendingPhone}</span> <br />
            позвоните на номер ниже:
          </p>

          <div className="rounded-2xl border-2 border-gray-100 bg-white px-6 py-5 font-mono text-2xl font-bold tracking-widest text-black shadow-sm ring-1 ring-black/5">
            {callNumber || "Загрузка..."}
          </div>

          {callNumber && (
            <Button asChild variant="default" size="lg" className="desktop:hidden mt-2 w-full">
              <a href={`tel:${callNumber}`}>Позвонить</a>
            </Button>
          )}

          <div className="mt-2 flex flex-col gap-3">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-gray-600"
              onClick={() => router.refresh()}
            >
              Я уже позвонил
            </Button>
            <p className="text-[10px] leading-tight text-gray-400">
              Нажмите кнопку выше, если после звонка <br /> переход не произошел автоматически.
            </p>
          </div>
        </div>

        {stage === "success" && (
          <p className="animate-pulse font-medium text-green-600">Вход выполнен!</p>
        )}
      </div>
    );
  }

  return (
    <form
      className={cn("flex flex-col gap-4", className)}
      onSubmit={(e) => {
        e.preventDefault();
        if (isValid) setOpenModal(true);
      }}
    >
      <Controller
        name="phone"
        control={control}
        render={({ field }) => (
          <PhoneInput
            {...field}
            id="phone"
            autoFocus
            error={error ?? undefined}
            disabled={stage !== "idle"}
          />
        )}
      />
      <Button type="submit" size="lg" disabled={!isValid || stage !== "idle"}>
        Далее
      </Button>
      <ModalDialog open={openModal} onOpenChange={setOpenModal} overlay="card">
        <AlertDialogHeader className="desktop:mt-0 mt-2">
          <AlertDialogTitle className="text-tight font-medium text-black">
            {getValues("phone")}
          </AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogDescription className="text-gray subtext-tight desktop:mb-4 font-normal">
          Номер телефона указан верно?
        </AlertDialogDescription>
        <AlertDialogFooter className="desktop:gap-2 flex-row justify-end gap-6">
          <Button
            variant="outline"
            size="sm"
            className="desktop:flex-0 flex flex-1"
            onClick={() => setOpenModal(false)}
          >
            Изменить
          </Button>
          <Button
            variant="default"
            size="sm"
            className="desktop:flex-0 flex flex-1"
            onClick={() => handleSubmit(onSubmit)()}
          >
            Верно
          </Button>
        </AlertDialogFooter>
      </ModalDialog>
    </form>
  );
};
