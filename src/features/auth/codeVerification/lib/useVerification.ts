"use client";

import { useEffect } from "react";

import { saveIsFilledToCookie } from "@/shared/api/actions/saveIsFilledToCookie";
import { useAuthStore } from "@/shared/api/store";

import { sendCode } from "../../phoneForm/api/sendCode";
import { loginByCodeAction } from "../actions/api/loginByCodeAction";
import { VerificationResult } from "../model/types";
import { useVerificationStore } from "../model/userVerificationStore";

type UseVerificationOptions = {
  phone_number: string;
  initialAttemptsLeft?: number;
  resendBlockTime?: number;
  banTime?: {
    firstBan: number;
    repeatBan: number;
  };
};

const DEFAULTS = {
  initialAttemptsLeft: 5,
  resendBlockTime: 120,
  banTime: { firstBan: 600, repeatBan: 3599 },
} as const;

export const useVerification = ({
  // eslint-disable-next-line @typescript-eslint/naming-convention
  phone_number,
  resendBlockTime = DEFAULTS.resendBlockTime,
  banTime = DEFAULTS.banTime,
}: UseVerificationOptions) => {
  const {
    attemptsLeft,
    banLevel,
    lastResendAt,
    banUntil,

    resendTimer,
    isResendAvailable,
    isBanned,
    isCodeExpired,

    setAttemptsLeft,
    setBanLevel,
    setLastResendAt,
    setBanUntil,
    setResendTimer,
    setIsResendAvailable,
    setIsBanned,
    setIsCodeExpired,
    hasHydrated,
    resetVerification,
  } = useVerificationStore();

  const { setAccessToken } = useAuthStore();

  useEffect(() => {
    if (!hasHydrated) return;
    if (lastResendAt !== null) return;

    const now = Date.now();
    setLastResendAt(now);
    setIsResendAvailable(false);
    setResendTimer(resendBlockTime);
  }, [hasHydrated, lastResendAt, resendBlockTime]);

  useEffect(() => {
    const updateTimers = () => {
      const now = Date.now();

      const sinceLastResendSec = lastResendAt ? (now - lastResendAt) / 1000 : Infinity;
      const resendRemaining = Math.max(0, resendBlockTime - sinceLastResendSec);

      const banRemaining = banUntil > 0 ? Math.max(0, (banUntil - now) / 1000) : 0;

      const remaining = Math.ceil(Math.max(resendRemaining, banRemaining));

      setResendTimer(remaining);
      setIsResendAvailable(resendRemaining <= 0 && banRemaining <= 0);
      setIsBanned(banRemaining > 0);
      if (banRemaining <= 0 && isBanned) {
        setAttemptsLeft(() => 1);
      }
    };

    updateTimers();

    const interval = setInterval(updateTimers, 1000);

    return () => clearInterval(interval);
  }, [lastResendAt, banUntil, resendBlockTime, isBanned]);

  const applyBan = () => {
    const level = banLevel + 1;
    const durationSec = level === 1 ? banTime.firstBan : banTime.repeatBan;

    setBanUntil(Date.now() + durationSec * 1000);
    setBanLevel(level);
    setIsBanned(true);
  };

  const onComplete = async (code: string): Promise<VerificationResult> => {
    if (isBanned || !code || code.length !== 5) {
      return { success: false };
    }

    const response = await loginByCodeAction({ phone_number, code });

    if (!response.success) {
      setAttemptsLeft((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          applyBan();
        }
        return Math.max(0, next);
      });
      const isExpired = response.error.includes("истек") || response.error.includes("Запросите");

      if (isExpired) {
        setIsCodeExpired(true);
      }
      return {
        success: false,
        error: response.error,
      };
    }

    if (response.access_token) {
      setIsCodeExpired(false);
      setAccessToken(response.access_token);
      await saveIsFilledToCookie(response.is_filled ?? false);
      resetVerification();
      return { success: true, is_filled: response.is_filled };
    }

    return { success: false };
  };

  const onResend = async () => {
    if (!isResendAvailable) return;

    // resetVerification();
    // setLastResendAt(Date.now());
    // setResendTimer(resendBlockTime);
    // setIsResendAvailable(false);
    // setIsCodeExpired(false);
    const result = await sendCode({
      phone_number: phone_number.replaceAll(" ", ""),
      code_length: 5,
    });

    if (result.success) {
      resetVerification();
    } else {
      alert(result.error);
    }
  };

  return {
    attemptsLeft,
    banLevel,
    resendTimer,
    isBanned,
    isResendAvailable,
    isCodeExpired,
    setIsCodeExpired,
    onComplete,
    onResend,
  };
};
