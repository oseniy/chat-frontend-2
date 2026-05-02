"use client";

import { QueryClientProvider } from "@tanstack/react-query";

import { queryClient } from "../api/getQueryClient";

export default function QueryCustomProvider({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
