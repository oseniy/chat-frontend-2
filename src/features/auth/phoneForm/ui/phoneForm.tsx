"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
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
  const [, setPendingPhone] = useState("");

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

  const onSubmit = async (data: PhoneData) => {
    setOpenModal(false);
    setPhone(data.phone);
    setPendingPhone(data.phone);
    await start(data.phone.replaceAll(" ", ""));
  };

  if (stage === "calling" || stage === "success") {
    return (
      <div className={cn("flex flex-col items-center gap-6 py-10 text-center", className)}>
        <div className="border-primary mb-2 h-10 w-10 animate-spin rounded-full border-4 border-t-transparent" />
        <h3 className="text-lg font-semibold text-black">Авторизация по звонку</h3>
        <p className="text-sm text-gray-500">Позвоните на номер:</p>
        <div className="rounded-2xl bg-gray-100 px-6 py-4 font-mono text-2xl font-bold text-black">
          {callNumber || "Загрузка..."}
        </div>
        {callNumber && (
          <Button asChild variant="default" size="lg" className="desktop:hidden w-full">
            <a href={`tel:${callNumber}`}>Позвонить</a>
          </Button>
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
