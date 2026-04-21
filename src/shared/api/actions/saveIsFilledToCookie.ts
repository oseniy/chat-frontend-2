"use server";

import { cookies } from "next/headers";

export async function saveIsFilledToCookie(value: boolean) {
  const cookieStore = await cookies();

  if (value) {
    cookieStore.set({
      name: "is_filled",
      value: "true",
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  } else {
    cookieStore.delete("is_filled");
  }
}
