import { format, isToday, isYesterday } from "date-fns";
import { ru } from "date-fns/locale";

import { MappedChatMessage } from "../model/types/mappedTypes";

export const groupMessagesByDate = (messages: MappedChatMessage[]) => {
  const sortedMessages = [...messages].sort((a, b) => {
    const byTime = a.createdAt - b.createdAt;
    if (byTime !== 0) return byTime;
    return (a.id || 0) - (b.id || 0);
  });

  const groups = new Map<string, MappedChatMessage[]>();

  for (const message of sortedMessages) {
    const timestamp = message.createdAt * 1000;
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) continue;

    const key = format(date, "yyyy-MM-dd");
    const bucket = groups.get(key) ?? [];
    bucket.push(message);
    groups.set(key, bucket);
  }

  return Array.from(groups.entries()).map(([key, messages]) => {
    const date = new Date(key);

    let label = format(date, "d MMMM yyyy", { locale: ru });
    if (isToday(date)) label = "Сегодня";
    else if (isYesterday(date)) label = "Вчера";
    else if (date.getFullYear() === new Date().getFullYear()) {
      label = format(date, "d MMMM", { locale: ru });
    }

    return { id: key, date: key, label, messages };
  });
};
