"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import z from "zod";

import { UpdateProfileData, User } from "@/entities/user/model/types";
import { NicknameInput } from "@/features/auth/userForm/ui/nicknameInput";
import { FormInput } from "@/shared/form/ui/formInput";
import { cn } from "@/shared/shadcn/lib/utils";
import { Button } from "@/shared/shadcn/ui/button";

import { AvatarSection } from "../../../../shared/avatar/ui/avatarSelection";
import { useUserProfileForm } from "../lib/useUserProfileForm";
import { prepareSubmitData } from "../model/prepareSubmitData";
import { changeProfileSchema } from "../model/schema";
import { BirthdaySelect } from "./birthdaySelect";

type FormData = z.infer<typeof changeProfileSchema>;

type UserProfileFormProps = {
  className?: string;
  profile: User;
  avatarUrl: string;
  name: string;
  phone: string;
  lastName: string;
  nickname: string;
  description: string;
  birthday: number | null;
  onSubmit: (data: UpdateProfileData) => Promise<void>;
};

export const UserProfileForm: React.FC<UserProfileFormProps> = ({
  className,
  profile,
  avatarUrl,
  name,
  lastName,
  nickname,
  description,
  birthday,
  onSubmit,
}) => {
  const {
    currentAvatarUrl,
    isAvatarChangeModalOpen,
    getDefaultValues,
    onAvatarDelete,
    onAvatarChangeHandler,
    setIsAvatarChangeModalOpen,
  } = useUserProfileForm({
    profile,
    avatarUrl,
    name,
    lastName,
    nickname,
    description,
    birthday,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(changeProfileSchema),
    mode: "onChange",
    defaultValues: getDefaultValues(name, lastName, nickname, description),
  });

  const { register, handleSubmit, control, formState } = form;
  const { errors, isValid, isDirty, isSubmitting } = formState;

  const handleSubmitForm = async (data: FormData) => {
    const submitData = prepareSubmitData(data, profile, birthday);
    await onSubmit(submitData);
  };

  console.log("All form errors:", errors);
  console.log("Birthday object errors:", errors.birthday);

  return (
    <div className={cn("", className)}>
      <AvatarSection
        avatarUrl={currentAvatarUrl}
        onAvatarDelete={onAvatarDelete}
        onAvatarChange={onAvatarChangeHandler}
        isAvatarChangeModalOpen={isAvatarChangeModalOpen}
        setIsModalOpen={setIsAvatarChangeModalOpen}
      />

      <FormProvider {...form}>
        <form className="flex flex-col gap-3" onSubmit={handleSubmit(handleSubmitForm)}>
          <FormInput
            id="name"
            label="Изменить имя"
            error={errors.name?.message}
            {...register("name")}
            inputClassName="desktop:border-0 font-normal"
          />
          <FormInput
            id="lastName"
            label="Изменить фамилию"
            error={errors.lastName?.message}
            {...register("lastName")}
            inputClassName="desktop:border-0 font-normal"
          />

          <NicknameInput name="nickname" label="Изменить никнейм" isBordered={false} />

          <BirthdaySelect control={control} />

          <FormInput
            id="description"
            label="Изменить описание"
            error={errors.description?.message}
            inputClassName="desktop:border-0 font-normal"
            {...register("description")}
          />

          <Button
            variant="default"
            size="lg"
            type="submit"
            className="mt-4"
            disabled={!isValid || !isDirty || isSubmitting}
          >
            Сохранить
          </Button>
        </form>
      </FormProvider>
    </div>
  );
};
