import axios, { AxiosError, AxiosHeaders, InternalAxiosRequestConfig } from "axios";

import { API_CONFIG } from "./base";
import { useAuthStore } from "./store";

interface CustomConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export const getApiClient = axios.create({
  ...API_CONFIG,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else if (token) prom.resolve(token);
  });
  failedQueue = [];
};

// Request Interceptor — берём токен ТОЛЬКО из Zustand
getApiClient.interceptors.request.use(async (config) => {
  const state = useAuthStore.getState();

  if (!state.isInitialized) {
    await new Promise<void>((resolve) => {
      const unsubscribe = useAuthStore.subscribe((newState) => {
        if (newState.isInitialized) {
          unsubscribe();
          resolve();
        }
      });
    });
  }

  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers ??= new AxiosHeaders();
    config.headers.set("Authorization", `Bearer ${token}`);
  }

  return config;
});

// Response Interceptor — рефреш + очередь + обновление Zustand
getApiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as CustomConfig;

    if (!config || error.response?.status !== 401 || config._retry) {
      return Promise.reject(error);
    }

    config._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          config.headers?.set("Authorization", `Bearer ${token}`);
          return getApiClient(config);
        })
        .catch((err) => Promise.reject(err));
    }

    isRefreshing = true;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const refreshUrl = `${apiUrl}/api/v1/auth/login/refresh/token/`;

      const res = await fetch(refreshUrl, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Refresh failed");

      const data = await res.json();
      const newAccessToken = data.access;
      if (!newAccessToken) throw new Error("No access token in refresh response");

      useAuthStore.getState().setAccessToken(newAccessToken);
      processQueue(null, newAccessToken);

      config.headers?.set("Authorization", `Bearer ${newAccessToken}`);
      return getApiClient(config);
    } catch (err) {
      const { logout } = await import("./logout");
      logout();
      window.location.href = "/auth";
      processQueue(err as Error, null);
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
      failedQueue = [];
    }
  },
);

export default getApiClient;
