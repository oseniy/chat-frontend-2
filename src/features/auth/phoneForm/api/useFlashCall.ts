// Типы для ответов
export interface FlashCallStartResponse {
  session_uid: string;
  session_secret: string;
  poll_interval_seconds: number;
}

export interface FlashCallStatusResponse {
  status: "pending" | "verified" | "expired" | "consumed";
}

export interface FlashCallClaimResponse {
  access: string;
  refresh: string;
  is_filled: boolean;
}

// Функции запросов
export const startFlashCall = (phone: string) =>
  fetch("/api/v1/auth/providers/plusofon/flash-call/start/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone_number: phone }),
  }).then((res) => res.json());

export const checkFlashCallStatus = (uid: string, secret: string) =>
  fetch(`/api/v1/auth/providers/plusofon/flash-call/status/${uid}/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_secret: secret }),
  }).then((res) => res.json());

export const claimFlashCallTokens = (uid: string, secret: string) =>
  fetch(`/api/v1/auth/providers/plusofon/flash-call/claim/${uid}/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_secret: secret }),
  }).then((res) => res.json());
