"use client";

import { useEffect, useState } from "react";
import { Control, Controller, useFormState, useWatch } from "react-hook-form";
import z from "zod";

import { Label } from "@/shared/shadcn/ui/label";
import { Select } from "@/shared/ui/select/select";

import { DAYS, MONTHS, YEARS } from "../lib/constants";
import { changeProfileSchema } from "../model/schema";

type BirthdaySelectProps = {
  control: Control<z.infer<typeof changeProfileSchema>>;
};

export const BirthdaySelect: React.FC<BirthdaySelectProps> = ({ control }) => {
  const [birthdayError, setBirthdayError] = useState<string | undefined>();

  const birthday = useWatch({
    control,
    name: "birthday",
  });

  const { errors } = useFormState({ control });

  useEffect(() => {
    if (errors.birthday?.message) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBirthdayError(errors.birthday.message);
      return;
    }

    if (birthday) {
      const { day, month, year } = birthday;

      if (day && month && year) {
        const date = new Date(year, month - 1, day);

        const isValidDate =
          date.getFullYear() === year &&
          date.getMonth() === month - 1 &&
          date.getDate() === day &&
          date <= new Date();

        if (!isValidDate) {
          setBirthdayError("Укажите корректную дату рождения");
          return;
        }

        const currentYear = new Date().getFullYear();
        if (year < 1900 || year > currentYear) {
          setBirthdayError(`Год должен быть от 1900 до ${currentYear}`);
          return;
        }

        setBirthdayError(undefined);
      } else {
        setBirthdayError(undefined);
      }
    } else {
      setBirthdayError(undefined);
    }
  }, [birthday, errors.birthday]);

  return (
    <div className="flex flex-col gap-1">
      <Label className={birthdayError ? "text-error" : ""}>
        {birthdayError ? birthdayError : "Введите дату своего рождения"}
      </Label>
      <div className="flex gap-1">
        <Controller
          name="birthday.day"
          control={control}
          render={({ field }) => (
            <Select
              options={DAYS}
              value={field.value}
              onChange={field.onChange}
              placeholder="День"
              className="w-[80px] max-w-[80px] min-w-[80px]"
            />
          )}
        />
        <Controller
          name="birthday.month"
          control={control}
          render={({ field }) => (
            <Select
              options={MONTHS}
              value={field.value}
              onChange={field.onChange}
              placeholder="Месяц"
              className="w-[133px] max-w-[133px] min-w-[133px]"
            />
          )}
        />
        <Controller
          name="birthday.year"
          control={control}
          render={({ field }) => (
            <Select
              options={YEARS}
              value={field.value}
              onChange={field.onChange}
              placeholder="Год"
              className="w-full"
            />
          )}
        />
      </div>
    </div>
  );
};
