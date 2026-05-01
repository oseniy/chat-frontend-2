"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";

import { updateProfile } from "@/entities/user/api/updateProfile";
import { saveIsFilledToCookie } from "@/shared/api/actions/saveIsFilledToCookie";
import { FormInput } from "@/shared/form/ui/formInput";
import { cn } from "@/shared/shadcn/lib/utils";
import { Button } from "@/shared/shadcn/ui/button";

import { useUserFormStore } from "../model/store";
import { UserFormData, userFormSchema } from "../model/validation";
import { NicknameInput } from "./nicknameInput";

type UserFormProps = {
  className?: string;
};

export const UserForm: React.FC<UserFormProps> = ({ className }) => {
  const router = useRouter();
  const setUser = useUserFormStore((state) => state.setUser);

  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      firstName: "",
      nickname: "",
    },
  });

  const {
    handleSubmit,
    reset,
    register,
    formState: { errors, isValid },
  } = form;

  const onSubmit = async (data: UserFormData) => {
    const result = await updateProfile({
      first_name: data.firstName.trim(),
      nickname: data.nickname.trim(),
    });

    if (!result.success) {
      alert(result.error);
      return;
    }

    setUser(data);
    reset();
    await saveIsFilledToCookie(true);
    router.push("/auth/success");
  };

  return (
    <div className={cn("h-full", className)}>
      <FormProvider {...form}>
        <form
          className="flex h-full flex-col place-content-between"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="flex flex-col gap-2">
            <FormInput
              id="firstName"
              label="Введите имя"
              error={errors.firstName?.message}
              {...register("firstName")}
              onKeyDown={(e) => {
                const input = e.target as HTMLInputElement;

                const { selectionStart, selectionEnd } = input;

                const isReplacingFromStart =
                  selectionStart === 0 && selectionEnd !== null && selectionEnd > 0;

                const isCursorAtStart = selectionStart === 0 && selectionEnd === 0;

                if (e.key === " " && (isCursorAtStart || isReplacingFromStart)) {
                  e.preventDefault();
                }
              }}
              onChange={(e) => {
                let value = e.target.value;

                value = value.replace(/\s*-\s*/g, "-").replace(/\s{2,}/g, " ");

                form.setValue("firstName", value, {
                  shouldValidate: true,
                  shouldDirty: true,
                });
              }}
            />

            <NicknameInput name="nickname" />
          </div>

          <div className="mt-auto flex flex-col gap-4">
            <p className="caption text-gray font-medium">
              Нажимая на «Зарегистрироваться», вы соглашаетесь c{" "}
              <Button type="button" variant="text" size="inline" className="caption" asChild>
                <Link href="https://achat.ktsf.ru/agreement" target="_blank">
                  Пользовательским соглашением
                </Link>
              </Button>
              .
            </p>

            <Button variant="default" size="lg" type="submit" disabled={!isValid}>
              Далее
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};
