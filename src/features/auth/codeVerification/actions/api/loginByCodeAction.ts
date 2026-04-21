"use server";

import { cookies } from "next/headers";
import { z } from "zod";

const LoginByCodeSchema = z.object({
  phone_number: z.string().regex(/^\+7\d{10}$/, "Неверный номер телефона"),
  code: z.string().length(5, "Код должен быть из 5 цифр"),
});

export async function loginByCodeAction(data: z.infer<typeof LoginByCodeSchema>) {
  const validated = LoginByCodeSchema.safeParse(data);
  if (!validated.success) {
    return { success: false, error: "Неверный код. Повторите попытку" };
  }

  const { phone_number, code } = validated.data;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/messenger/login/get/token/`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number, code }),
      },
    );

    if (!res.ok) {
      const error = await res.json();
      return {
        success: false,
        error: error.detail || error.message || "Неверный код",
      };
    }

    const { access, refresh, is_filled } = await res.json();
    const cookieStore = await cookies();
    cookieStore.set({
      name: "refresh_token",
      value: refresh,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return { success: true, access_token: access, is_filled };
  } catch {
    return { success: false, error: "Сервер недоступен. Попробуйте позже" };
  }
}
