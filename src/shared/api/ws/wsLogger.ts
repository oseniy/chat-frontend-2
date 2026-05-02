const INCOMING_STYLE = "color: #4CAF50; font-weight: bold";
const OUTGOING_STYLE = "color: #2196F3; font-weight: bold";
const QUEUED_STYLE = "color: #FF9800; font-weight: bold";

export const logIncomingMessage = (data: unknown) => {
  console.groupCollapsed("%c⬇ WS IN%c %s", INCOMING_STYLE, "", getAction(data));
  console.log("Data:", data);
  console.log("Time:", new Date().toLocaleTimeString());
  console.groupEnd();
};

export const logOutgoingMessage = (data: unknown) => {
  console.groupCollapsed("%c⬆ WS OUT%c %s", OUTGOING_STYLE, "", getAction(data));
  console.log("Data:", data);
  console.log("Time:", new Date().toLocaleTimeString());
  console.groupEnd();
};

export const logQueuedMessage = (data: unknown) => {
  console.groupCollapsed("%c⏳ WS QUEUED%c %s", QUEUED_STYLE, "", getAction(data));
  console.log("Data:", data);
  console.log("Time:", new Date().toLocaleTimeString());
  console.groupEnd();
};

const getAction = (data: unknown): string => {
  if (data && typeof data === "object" && "action" in data) {
    return String((data as { action: string }).action);
  }
  return "unknown";
};
