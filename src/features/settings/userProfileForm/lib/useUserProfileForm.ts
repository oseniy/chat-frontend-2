"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { uploadAvatar } from "@/entities/user/api/uploadAvatar";
import { User } from "@/entities/user/model/types";
import { deleteAvatar } from "@/features/createChat/api/deleteAvatar";

import { getDefaultBirthday } from "./getDefaultBirthday";

export type UseUserProfileFormProps = {
  profile: User;
  avatarUrl: string;
  name: string;
  lastName: string;
  nickname: string;
  description: string;
  birthday: number | null;
};

export const useUserProfileForm = ({ avatarUrl, birthday }: UseUserProfileFormProps) => {
  const queryClient = useQueryClient();

  const [currentAvatarUrl, setCurrentAvatarUrl] = useState(avatarUrl);
  const [isAvatarChangeModalOpen, setIsAvatarChangeModalOpen] = useState(false);
  /**
   * Возвращает дефолтные значения для UI-формы (birthday как объект)
   */
  const getDefaultValues = (
    name: string,
    lastName: string,
    nickname: string,
    description: string,
  ) => ({
    name: name || "",
    lastName: lastName || "",
    nickname: nickname || "",
    description: description || "",
    birthday: getDefaultBirthday(birthday),
  });

  const avatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const res = await uploadAvatar(file);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    onSuccess: (data) => {
      if (data?.file_url) {
        setTimeout(() => setCurrentAvatarUrl(data.file_url), 500);
      }
      queryClient.invalidateQueries({ queryKey: ["messenger-profile"] });
    },
    onError: (error: Error) => {
      console.error("Ошибка загрузки аватара:", error.message);
    },
  });

  const deleteAvatarMutation = useMutation({
    mutationFn: async () => {
      const res = await deleteAvatar();
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => {
      setCurrentAvatarUrl("");
      queryClient.invalidateQueries({ queryKey: ["messenger-profile"] });
    },
  });

  const onAvatarDelete = () => {
    deleteAvatarMutation.mutate();
  };

  const onAvatarChangeHandler = (file: File) => {
    avatarMutation.mutate(file);
  };

  return {
    currentAvatarUrl,
    isAvatarChangeModalOpen,
    getDefaultValues,
    onAvatarDelete,
    setIsAvatarChangeModalOpen,
    onAvatarChangeHandler,
  };
};
