type AuthChannelMessage = { type: "logout" | "login" };

let channel: BroadcastChannel | null = null;

const getChannel = (): BroadcastChannel | null => {
  if (typeof window === "undefined") return null;

  if (!channel) {
    channel = new BroadcastChannel("auth");
  }

  return channel;
};

export const broadcastLogout = () => {
  getChannel()?.postMessage({ type: "logout" } satisfies AuthChannelMessage);
};

export const broadcastLogin = () => {
  getChannel()?.postMessage({ type: "login" } satisfies AuthChannelMessage);
};

export const onAuthChannelMessage = (callback: (msg: AuthChannelMessage) => void) => {
  const ch = getChannel();
  if (!ch) return () => {};

  const handler = (event: MessageEvent<AuthChannelMessage>) => {
    callback(event.data);
  };

  ch.addEventListener("message", handler);

  return () => {
    ch.removeEventListener("message", handler);
  };
};
