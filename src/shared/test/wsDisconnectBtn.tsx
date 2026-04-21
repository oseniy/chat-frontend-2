"use client";

import { cn } from "@/shared/shadcn/lib/utils";
import { Button } from "@/shared/shadcn/ui/button";

import { useAuthStore } from "../api/store";
import { getSocket } from "../api/ws/wsClient";

type WsDisconnectBtnProps = {
  className?: string;
};

export const WsDisconnectBtn: React.FC<WsDisconnectBtnProps> = ({ className }) => {
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const wsDisconnect = () => {
    const socket = getSocket();
    setAccessToken("");
    socket?.close();
  };
  return (
    <Button className={cn("", className)} size="md" onClick={wsDisconnect}>
      Разорвать сокет
    </Button>
  );
};
