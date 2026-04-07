import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { fileToBase64 } from "@/shared/lib/files/fileToBase64";

import { deleteAvatar } from "../api/deleteAvatar";
import { formSchema } from "../model/schema";
import { useCreateChatStore } from "../model/store";
import { CreateChatFormValues } from "../model/types";
import { getInitialPreview } from "./getInitialPreview";
import { mapChatTypeToValue, mapValueToChatType } from "./mapChatType";

export const useCreateChat = () => {
  const { formData, updateData, setStep, groupOrChannel } = useCreateChatStore();
  // Состояния для аватара
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>(getInitialPreview(formData.avatar));

  const form = useForm<CreateChatFormValues>({
    mode: "onChange",
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: formData.title,
      description: formData.description,
      avatar: formData.avatar,
      chat_type: mapChatTypeToValue(formData.chat_type, groupOrChannel),
    },
  });

  const handleAvatarChange = (file: File) => {
    form.setValue("avatar", file, { shouldValidate: true });

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
    setIsAvatarModalOpen(false);
  };

  const handleAvatarDelete = async () => {
    console.log("handleAvatarDelete");
    await deleteAvatar();
    form.setValue("avatar", null);
    setPreviewUrl("");
    setIsAvatarModalOpen(false);
  };

  const onNextStep = async (data: CreateChatFormValues) => {
    const finalChatType = mapValueToChatType(data.chat_type as 1 | 2, groupOrChannel);
    let avatarPayload = null;
    // Конвертируем здесь
    if (data.avatar instanceof File) {
      const base64String = await fileToBase64(data.avatar);
      avatarPayload = {
        filename: data.avatar.name,
        data: base64String.split(",")[1], // забираем только данные
      };
    }
    // Сохраняем данные первого шага в стор
    updateData({
      title: data.title,
      description: data.description,
      avatar: avatarPayload,
      chat_type: finalChatType,
    });
    // Переключаем на второй шаг (выбор участников)
    setStep(2);
  };

  return {
    form,
    isAvatarModalOpen,
    setIsAvatarModalOpen,
    previewUrl,
    handleAvatarChange,
    handleAvatarDelete,
    onNextStep,
    isValid: form.formState.isValid,
    errors: form.formState.errors,
  };
};
