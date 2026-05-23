"use client";

import { useEffect, useRef } from "react";

import { getProfile } from "@/entities/user/api/getProfile";
import { useUserStore } from "@/entities/user/model/userStore";
import { useAuthStore } from "@/shared/api/store";
import { connectWS, disconnectWS, subscribeToWS } from "@/shared/api/ws/wsClient";

import { useWSRequestStore } from "../api/ws/model/wsRequest.store";
import { bootstrapWSHandlers } from "../api/ws/wsBootstrap";
import { dispatchWSEvent } from "../api/ws/wsHandlers";

export const WSProvider = ({ children }: { children: React.ReactNode }) => {
  const accessToken = useAuthStore((s) => s.accessToken);
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const setUserId = useUserStore((s) => s.setUserId);
  const userId = useUserStore((s) => s.userId);

  const prevTokenRef = useRef<string | null>(null);
  const userIdExtractedRef = useRef<boolean>(false);

  const fetchUserProfile = async () => {
    if (!accessToken) return;

    try {
      const userData = await getProfile();
      if (userData.success && userData.data.uid) {
        setUserId(userData.data.uid);
        userIdExtractedRef.current = true;
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
    }
  };

  useEffect(() => {
    if (accessToken && !userId) {
      fetchUserProfile();
    }

    const unsubscribe = subscribeToWS((data) => {
      if (data.request_uid) {
        useWSRequestStore.getState().fulfillRequest(data.request_uid, data);
      }
      dispatchWSEvent(data);
    });

    return () => unsubscribe();
  }, [setUserId, accessToken]);

  useEffect(() => {
    if (!isInitialized || !accessToken) return;
    bootstrapWSHandlers();
  }, [isInitialized, accessToken]);

  useEffect(() => {
    if (!isInitialized) return;

    if (accessToken && prevTokenRef.current !== accessToken) {
      userIdExtractedRef.current = false;
    }

    // Если токен есть, и он РЕАЛЬНО изменился — подключаем сокет
    if (accessToken) {
      if (prevTokenRef.current !== accessToken) {
        connectWS(accessToken);
        prevTokenRef.current = accessToken;
        fetchUserProfile();
      }
      return;
    }

    // ИСПРАВЛЕНО: Отключаем веб-сокет только в том случае, если accessToken стал null
    // И при этом в localStorage висит флаг, что пользователь нажал ЛОГАУТ.
    // Если флага нет — значит, это кратковременный фоновый рефреш, сокет рубить НЕ НАДО!
    const isLoggedOut = localStorage.getItem("isLoggedOut") === "true";

    if (accessToken === null && prevTokenRef.current && isLoggedOut) {
      disconnectWS();
      prevTokenRef.current = null;
      userIdExtractedRef.current = false;
    }
  }, [accessToken, isInitialized]);

  return <>{children}</>;
};
