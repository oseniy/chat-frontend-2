"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { AuthHeader } from "@/features/auth/codeVerification/ui/authHeader";
import { UserForm } from "@/features/auth/userForm/ui/userForm";
import { useAuthStore } from "@/shared/api/store";
import { BackgroundCardLayout } from "@/shared/layouts/card/backgroundCardLayout";

export default function Page() {
  const router = useRouter();
  const { accessToken, isInitialized } = useAuthStore();

  useEffect(() => {
    // Если проверка токена завершена и токена нет — редирект
    if (isInitialized && !accessToken) {
      router.replace("/auth/phone");
    }
  }, [isInitialized, accessToken, router]);

  // Пока идет инициализация, ничего не рендерим (или показываем Skeleton/Loader)
  if (!isInitialized) {
    return null; // Или <FullScreenLoader />
  }

  // Если инициализация прошла, но токена нет, useEffect сработает и сделает редирект.
  // Чтобы не мелькал контент формы на долю секунды, проверяем наличие токена.
  if (!accessToken) {
    return null;
  }

  return (
    <BackgroundCardLayout variant="form" className="pt-6">
      <AuthHeader
        backHref="/auth/phone"
        logoSize="sm"
        className="desktop:justify-center desktop:mt-12 desktop:pr-0 mt-5 justify-end pr-4"
        classBackButton="absolute desktop:left-20 top-2 left-8"
      />
      <h3 className="subheadline desktop:mb-6 mb-5 text-center font-semibold text-black">
        Личная информация
      </h3>
      <span className="text desktop:mb-6 mb-5 text-center text-black">
        Пожалуйста, заполните данные
      </span>
      <UserForm className="desktop:mx-16 mx-4 mb-10" />
    </BackgroundCardLayout>
  );
}
