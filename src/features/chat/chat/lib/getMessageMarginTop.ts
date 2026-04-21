import { MappedChatMessage } from "../model/types/mappedTypes";

export const getMessageMarginTop = (
  current: MappedChatMessage,
  previous?: MappedChatMessage,
): string => {
  if (!previous) return "mt-0";
  if (previous.fromUser.uid !== current.fromUser.uid) return "mt-2 desktop:mt-3";
  return "mt-1 desktop:mt-2";
};
