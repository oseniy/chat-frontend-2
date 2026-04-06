import { useCallback, useEffect, useRef, useState } from "react";

import { saveFlashCallAuthAction } from "@/features/auth/phoneForm/lib/actions/saveFlashCallAuth";
import { saveIsFilledToCookie } from "@/shared/api/actions/saveIsFilledToCookie";
import { saveTokenToCookie } from "@/shared/api/actions/saveTokenToCookie";
import { API_CONFIG } from "@/shared/api/base";
import { useAuthStore } from "@/shared/api/store";

export const useFlashCall = () => {
  const [stage, setStage] = useState<"idle" | "calling" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [callNumber, setCallNumber] = useState<string | null>(null);
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
        const res = await fetch(`${BASE_URL}/api/v1/auth/providers/plusofon/flash-call/start/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone_number: phone }),
        });
        if (!res.ok) throw new Error("Ошибка запуска звонка");
        const { session_uid, session_secret, poll_interval_seconds, call_number } =
          await res.json();
        setCallNumber(call_number);

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
              const data = await statusRes.json();
              if (data.status === "verified") {
                stopPolling();
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
                  await saveFlashCallAuthAction(tokens.refresh);
                  await saveTokenToCookie(tokens.access);
                  await saveIsFilledToCookie(tokens.is_filled ?? false);
                  setAccessToken(tokens.access);
                  setStage("success");
                  setTimeout(() => {
                    window.location.href = "/chats";
                  }, 400);
                }
              }
            } catch (e) {
              console.error(e);
            }
          },
          (poll_interval_seconds || 2) * 1000,
        );
      } catch (err: unknown) {
        stopPolling();
        setStage("error");
        setError(err instanceof Error ? err.message : "Ошибка");
      }
    },
    [BASE_URL, setAccessToken, stopPolling],
  );

  useEffect(() => () => stopPolling(), [stopPolling]);
  return { start, stage, error, callNumber };
};
