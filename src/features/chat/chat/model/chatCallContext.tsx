"use client";

import { createContext, useCallback, useContext } from "react";

import { useChatStore } from "@/entities/chat/model/useChatStore";
import { useOutgoingCall } from "@/features/call";

const chatCallContext = createContext<(() => void) | null>(null);

export const ChatCallProvider = ({ children }: { children: React.ReactNode }) => {
  const chatUid = useChatStore((s) => s.chatUid);
  const chatType = useChatStore((s) => s.chatType);
  const peerName = useChatStore((s) => s.peerName);
  const peerPhoto = useChatStore((s) => s.peerPhoto);
  const { startAudioCall } = useOutgoingCall();

  const handleCallClick = useCallback(() => {
    if (chatType !== "chat" || !chatUid || !peerName) return;
    startAudioCall({
      uid: chatUid,
      name: peerName,
      avatarUrl: peerPhoto,
    });
  }, [chatType, chatUid, peerName, peerPhoto, startAudioCall]);

  const value = chatType === "chat" ? handleCallClick : null;

  return <chatCallContext.Provider value={value}>{children}</chatCallContext.Provider>;
};

export const useChatCall = () => useContext(chatCallContext);
