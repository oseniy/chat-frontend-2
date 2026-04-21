"use client";

import { useEffect, useRef } from "react";
import { useFormContext } from "react-hook-form";

import { checkNicknameUnique } from "@/entities/user/api/checkNicknameUnique";
import { FormInput } from "@/shared/form/ui/formInput";
import { cn } from "@/shared/shadcn/lib/utils";

import { nicknameSchema } from "../model/validation";
import { UserFormData } from "../model/validation";

type NicknameInputProps = {
  name: "nickname";
  label?: string;
  isBordered?: boolean;
};

export const NicknameInput: React.FC<NicknameInputProps> = ({
  name,
  label = "Придумайте никнейм",
  isBordered = true,
}) => {
  const {
    register,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useFormContext<UserFormData>();

  const nickname = watch(name);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const trimmedNickname = nickname?.trim();
    if (!nicknameSchema.safeParse(trimmedNickname).success) {
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      const result = await checkNicknameUnique(trimmedNickname);

      if (!result.success) {
        setError(name, {
          type: "manual",
          message: result.error,
        });
      } else {
        // clearErrors(name);
      }
    }, 500);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [nickname, name, setError, clearErrors]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const trimmedValue = value.replace(/\s/g, "");

    setValue(name, trimmedValue, { shouldValidate: true });
  };

  return (
    <FormInput
      id={name}
      label={label}
      error={errors[name]?.message}
      {...register(name, {
        onChange: handleChange,
      })}
      inputClassName={cn(!isBordered && "desktop:border-0 font-normal")}
    />
  );
};
