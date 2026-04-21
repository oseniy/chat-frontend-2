"use client";

import { FormProvider } from "react-hook-form";

import { MappedChatDetails } from "@/entities/chat/lib/mapChat";
import { Field } from "@/features/createChat/ui/field";
import { AvatarSection } from "@/shared/avatar/ui/avatarSelection";
import { cn } from "@/shared/shadcn/lib/utils";
import { Button } from "@/shared/shadcn/ui/button";

import { useEditChat } from "../lib/useEditChat";
import { ChatTypeSelect } from "./chatTypeSelect";

type EditChatFormProps = {
  className?: string;
  chatKey: string;
  chatInfo: MappedChatDetails;
};

export const EditChatForm: React.FC<EditChatFormProps> = ({ className, chatKey, chatInfo }) => {
  const {
    form,
    groupOrChannel,
    isAvatarModalOpen,
    setIsAvatarModalOpen,
    previewUrl,
    handleAvatarChange,
    handleAvatarDelete,
    onSubmit,
    isValid,
    isSubmitting,
  } = useEditChat(chatKey, chatInfo);

  return (
    <FormProvider {...form}>
      <form
        className={cn("mb-4 flex h-full flex-col px-4", className)}
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className="flex h-full w-full flex-col justify-between">
          <div className="flex w-full flex-col gap-4">
            <AvatarSection
              avatarUrl={previewUrl}
              onAvatarDelete={handleAvatarDelete}
              onAvatarChange={handleAvatarChange}
              isAvatarChangeModalOpen={isAvatarModalOpen}
              setIsModalOpen={setIsAvatarModalOpen}
              avatarVariant="chat"
            />

            <div>
              <Field name="title" title="Название*" maxLength={100} position="upper" />
              <Field name="description" title="Описание" maxLength={250} position="lower" />
            </div>

            <ChatTypeSelect mode={groupOrChannel} />
          </div>

          <div className="w-full">
            <Button
              variant="default"
              size="md"
              type="submit"
              className="desktop:mb-2 mt-4 w-full"
              disabled={!isValid || isSubmitting}
            >
              {isSubmitting ? "Сохранение..." : "Сохранить"}
            </Button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};
