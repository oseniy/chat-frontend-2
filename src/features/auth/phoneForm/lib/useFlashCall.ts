import { useCallback, useEffect, useRef, useState } from "react";

import { saveFlashCallAuthAction } from "@/features/auth/phoneForm/lib/actions/saveFlashCallAuth.ts";
import { saveIsFilledToCookie } from "@/shared/api/actions/saveIsFilledToCookie";
import { saveTokenToCookie } from "@/shared/api/actions/saveTokenToCookie";
import { API_CONFIG } from "@/shared/api/base";
import { useAuthStore } from "@/shared/api/store";

export const useFlashCall = () => {
  const [stage, setStage] = useState<"idle" | "calling" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [callNumber, setCallNumber] = useState<string | null>(null); // Номер для отображения пользователю
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { setAccessToken } = useAuthStore();
  const BASE_URL = API_CONFIG.baseURL;

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  const start = useCallback(
    async (phone: string) => {
      if (!BASE_URL) return setError("API URL не настроен");

      setStage("calling");
      setError(null);
      setCallNumber(null);

      try {
        // 1. СТАРТ СЕССИИ
        const res = await fetch(`${BASE_URL}/api/v1/auth/providers/plusofon/flash-call/start/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone_number: phone }),
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          if (res.status === 409) throw new Error("Сессия уже активна.");
          throw new Error(errorData.message || `Ошибка сервера: ${res.status}`);
        }

        const dataStart = await res.json();
        const { session_uid, session_secret, poll_interval_seconds, call_number } = dataStart;

        // Сохраняем номер, на который пользователю нужно будет позвонить (или с которого позвонят)
        setCallNumber(call_number);

        // 2. ПОЛЛИНГ СТАТУСА
        pollingRef.current = setInterval(
          async () => {
            try {
              const statusRes = await fetch(
                `${BASE_URL}/api/v1/auth/providers/plusofon/flash-call/status/${session_uid}/`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ session_secret }),
                },
              );

              if (!statusRes.ok) return;
              const statusData = await statusRes.json();

              if (statusData.status === "verified") {
                stopPolling();

                // 3. ПОЛУЧЕНИЕ ТОКЕНОВ (CLAIM)
                const claimRes = await fetch(
                  `${BASE_URL}/api/v1/auth/providers/plusofon/flash-call/claim/${session_uid}/`,
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ session_secret }),
                  },
                );

                if (claimRes.ok) {
                  const tokens = await claimRes.json();

                  // Сохраняем всю сессию в куки и стор
                  await saveFlashCallAuthAction(tokens.refresh);
                  await saveTokenToCookie(tokens.access);
                  await saveIsFilledToCookie(tokens.is_filled ?? false);

                  setAccessToken(tokens.access);
                  setStage("success");

                  setTimeout(() => {
                    window.location.href = "/chats";
                  }, 500);
                }
              }

              if (statusData.status === "expired" || statusData.status === "failed") {
                stopPolling();
                setStage("error");
                setError("Время ожидания истекло. Попробуйте еще раз.");
              }
            } catch (e) {
              console.error("Status check error:", e);
            }
          },
          (poll_interval_seconds || 2) * 1000,
        );
      } catch (err: unknown) {
        stopPolling();
        setStage("error");
        setError(err instanceof Error ? err.message : "Ошибка авторизации");
      }
    },
    [BASE_URL, setAccessToken, stopPolling],
  );

  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  return { start, stage, error, callNumber };
};
