"use server";

import { cookies } from "next/headers";

export async function savePhoneToCookie(phone: string) {
  const cookieStore = await cookies();

  cookieStore.set({
    name: "phone",
    value: phone,
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 30,
  });
}
