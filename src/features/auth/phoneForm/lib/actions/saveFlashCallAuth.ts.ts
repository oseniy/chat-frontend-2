"use server";

import { cookies } from "next/headers";

export async function saveFlashCallAuthAction(refresh: string) {
  const cookieStore = await cookies();

  cookieStore.set({
    name: "refresh_token",
    value: refresh,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 дней
  });
}
