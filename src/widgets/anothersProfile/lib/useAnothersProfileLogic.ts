import { getChatTypeLight } from "@/entities/chat/lib/getChatTypeLight";

export const useAnothersProfileLogic = (chatKey: string) => {
  const chatType = getChatTypeLight(chatKey);
  const title =
    chatType === "chat"
      ? "Информация"
      : chatType === "group"
        ? "Информация о группе"
        : "Информация о канале";
  const name = "Имя Фамилия";
  const status = "В сети";
  return {
    title,
    name,
    status,
  };
};
