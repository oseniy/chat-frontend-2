import { create } from "zustand";

import { CallSession, CallStatus } from "./types";

export type CallLayoutMode = "window" | "fullscreen" | "minimized";

type CallStoreState = {
  session: CallSession | null;
  isMuted: boolean;
  isRemoteMuted: boolean;
  layoutMode: CallLayoutMode;

  setSession: (session: CallSession | null) => void;
  patchSession: (patch: Partial<CallSession>) => void;
  setStatus: (status: CallStatus) => void;
  setMuted: (muted: boolean) => void;
  setRemoteMuted: (muted: boolean) => void;
  setLayoutMode: (mode: CallLayoutMode) => void;
  reset: () => void;
};

export const useCallStore = create<CallStoreState>((set, get) => ({
  session: null,
  isMuted: false,
  isRemoteMuted: false,
  layoutMode: "window",

  setSession: (session) =>
    set({ session, isMuted: false, isRemoteMuted: false, layoutMode: "window" }),

  patchSession: (patch) => {
    const current = get().session;
    if (!current) return;
    set({ session: { ...current, ...patch } });
  },

  setStatus: (status) => {
    const current = get().session;
    if (!current) return;
    const connectedAt =
      status === "active" && !current.connectedAt ? Date.now() : current.connectedAt;
    set({ session: { ...current, status, connectedAt } });
  },

  setMuted: (muted) => set({ isMuted: muted }),

  setRemoteMuted: (muted) => set({ isRemoteMuted: muted }),

  setLayoutMode: (layoutMode) => set({ layoutMode }),

  reset: () => set({ session: null, isMuted: false, isRemoteMuted: false, layoutMode: "window" }),
}));
