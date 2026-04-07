import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const protectedRoutes = ["/chats", "/auth/success", "/settings"];
const authRoutes = ["/auth", "/auth/phone", "/auth/support", "/auth/support/success", "/auth/user"];

// Минимальный парсер JWT для проверки срока жизни (exp)
function isTokenExpired(token: string): boolean {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    const { exp } = JSON.parse(jsonPayload);
    // Проверяем с запасом в 10 секунд
    return Date.now() >= exp * 1000 - 10000;
  } catch {
    return true;
  }
}

async function refreshTokens(refreshToken: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/login/refresh/token/`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: refreshToken }),
      },
    );

    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

const createRedirectWithCookies = (url: URL, source: NextResponse): NextResponse => {
  const redirect = NextResponse.redirect(url);
  source.cookies.getAll().forEach((cookie) => {
    redirect.cookies.set(cookie);
  });
  return redirect;
};

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  let accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;
  const isFilled = request.cookies.get("is_filled")?.value === "true";

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", path);

  const response = NextResponse.next({ request: { headers: requestHeaders } });

  // --- ЛОГИКА РЕФРЕША ---
  // Если токена нет ИЛИ он просрочен, но есть рефреш
  if ((!accessToken || isTokenExpired(accessToken)) && refreshToken) {
    const newTokens = await refreshTokens(refreshToken);

    if (newTokens) {
      accessToken = newTokens.access;
      // Устанавливаем новые куки в ОТВЕТ (чтобы браузер их запомнил)
      response.cookies.set("accessToken", newTokens.access, { httpOnly: false });
      if (newTokens.refresh) {
        response.cookies.set("refresh_token", newTokens.refresh, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 30,
        });
      }

      // КРИТИЧЕСКИ ВАЖНО: Устанавливаем токен в ЗАПРОС,
      // чтобы серверные компоненты (RSC) получили свежий токен в этом же цикле
      request.cookies.set("accessToken", newTokens.access);
    } else {
      // Если рефреш не удался — удаляем куки и шлем на логин
      const loginUrl = new URL("/auth", request.url);
      const res = NextResponse.redirect(loginUrl);
      res.cookies.delete("accessToken");
      res.cookies.delete("refresh_token");
      return res;
    }
  }

  const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route));
  const isAuthRoute = authRoutes.includes(path);

  // 1. Защита приватных маршрутов
  if (isProtectedRoute && !refreshToken) {
    const url = new URL("/auth", request.url);
    url.searchParams.set("from", path);
    return createRedirectWithCookies(url, response);
  }

  // 1a. Пользователь авторизован, но профиль не заполнен → редирект на страницу заполнения
  if (isProtectedRoute && refreshToken && !isFilled) {
    return createRedirectWithCookies(new URL("/auth/user", request.url), response);
  }

  // 2. Перенаправление авторизованных пользователей с auth-страниц
  if (isAuthRoute && refreshToken && isFilled) {
    const redirectTo = request.nextUrl.searchParams.get("from") || "/chats";
    return createRedirectWithCookies(new URL(redirectTo, request.url), response);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
