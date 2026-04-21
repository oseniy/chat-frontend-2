import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { MappedChatDetails } from "@/entities/chat/lib/mapChat";
import { formSchema } from "@/features/createChat/model/schema";
import { CreateChatFormValues } from "@/features/createChat/model/types";
import { fileToBase64 } from "@/shared/lib/files/fileToBase64";

import { editChat } from "../api/ws";
import { mapChatTypeToValue, mapValueToChatType } from "./mapChatType";

export const useEditChat = (chatKey: string, chatInfo: MappedChatDetails) => {
  const groupOrChannel: "group" | "channel" = chatInfo.type.includes("group") ? "group" : "channel";

  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>(chatInfo.avatar ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarChanged, setAvatarChanged] = useState(false);

  const form = useForm<CreateChatFormValues>({
    mode: "onChange",
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: chatInfo.title,
      description: chatInfo.description,
      avatar: undefined,
      chat_type: mapChatTypeToValue(chatInfo.type, groupOrChannel),
    },
  });

  const handleAvatarChange = (file: File) => {
    form.setValue("avatar", file, { shouldValidate: true });
    setAvatarChanged(true);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
    setIsAvatarModalOpen(false);
  };

  const handleAvatarDelete = () => {
    form.setValue("avatar", null);
    setPreviewUrl("");
    setAvatarChanged(true);
    setIsAvatarModalOpen(false);
  };

  const onSubmit = async (data: CreateChatFormValues) => {
    setIsSubmitting(true);

    try {
      const finalChatType = mapValueToChatType(data.chat_type as 1 | 2, groupOrChannel);

      let avatarPayload = null;
      if (avatarChanged) {
        if (data.avatar instanceof File) {
          const base64String = await fileToBase64(data.avatar);
          avatarPayload = {
            filename: data.avatar.name,
            data: base64String.split(",")[1],
          };
        }
        // если avatarChanged === true, но avatar не File — значит удалён, отправляем null
      }

      await editChat({
        chat_key: chatKey,
        name: data.title,
        description: data.description,
        chat_type: finalChatType,
        avatar: avatarPayload,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    groupOrChannel,
    isAvatarModalOpen,
    setIsAvatarModalOpen,
    previewUrl,
    handleAvatarChange,
    handleAvatarDelete,
    onSubmit,
    isValid: form.formState.isValid,
    isSubmitting,
  };
};
