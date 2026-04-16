import { AxiosError } from "axios"; // Импортируем для правильной типизации ошибок
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { saveFlashCallAuthAction } from "@/features/auth/phoneForm/lib/actions/saveFlashCallAuth";
import { broadcastLogin } from "@/shared/api/authChannel";
import { getApiClient } from "@/shared/api/getApiClient";
import { useAuthStore } from "@/shared/api/store";

export const useFlashCall = () => {
  const [stage, setStage] = useState<"idle" | "calling" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [callNumber, setCallNumber] = useState<string | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const router = useRouter();
  const { setAccessToken } = useAuthStore();

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  const start = useCallback(
    async (phone: string) => {
      setStage("calling");
      setError(null);
      setCallNumber(null);

      try {
        // 1. START
        const startRes = await getApiClient.post<{
          session_uid: string;
          session_secret: string;
          poll_interval_seconds: number;
          call_number: string;
        }>("/api/v1/auth/providers/plusofon/flash-call/start/", {
          phone_number: phone,
        });

        const { session_uid, session_secret, poll_interval_seconds, call_number } = startRes.data;
        setCallNumber(call_number);

        // 2. STATUS POLLING
        pollingRef.current = setInterval(
          async () => {
            try {
              const statusRes = await getApiClient.post<{
                status: string;
              }>(`/api/v1/auth/providers/plusofon/flash-call/status/${session_uid}/`, {
                session_secret,
              });

              const data = statusRes.data;

              if (data.status === "verified") {
                stopPolling();

                // 3. CLAIM TOKENS
                const claimRes = await getApiClient.post<{
                  access: string;
                  refresh: string;
                  is_filled: boolean;
                }>(`/api/v1/auth/providers/plusofon/flash-call/claim/${session_uid}/`, {
                  session_secret,
                });

                const tokens = claimRes.data;

                await saveFlashCallAuthAction({
                  refresh: tokens.refresh,
                  access: tokens.access,
                  isFilled: tokens.is_filled ?? false,
                });

                setAccessToken(tokens.access);
                setStage("success");
                broadcastLogin();

                router.refresh();
                setTimeout(() => {
                  router.replace("/chats");
                }, 800);
              }

              if (data.status === "expired" || data.status === "failed") {
                stopPolling();
                setStage("error");
                setError("Время ожидания вызова истекло.");
              }
            } catch (e: unknown) {
              console.error("Polling error:", e instanceof Error ? e.message : e);
            }
          },
          (poll_interval_seconds || 2) * 1000,
        );
      } catch (err: unknown) {
        stopPolling();
        setStage("error");

        if (err instanceof AxiosError) {
          const serverMessage = err.response?.data?.message || err.response?.data?.detail;
          setError(serverMessage || err.message || "Ошибка авторизации");
        } else {
          setError(err instanceof Error ? err.message : "Неизвестная ошибка");
        }
      }
    },
    [setAccessToken, stopPolling, router],
  );

  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  return { start, stage, error, callNumber };
};
