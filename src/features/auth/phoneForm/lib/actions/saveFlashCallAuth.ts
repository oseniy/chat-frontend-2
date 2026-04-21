"use server";
import { cookies } from "next/headers";

type FlashCallAuthPayload = {
  refresh: string;
  access: string;
  isFilled: boolean;
};

export async function saveFlashCallAuthAction({ refresh, access, isFilled }: FlashCallAuthPayload) {
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

  cookieStore.set({
    name: "accessToken",
    value: access,
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 30,
  });

  if (isFilled) {
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
