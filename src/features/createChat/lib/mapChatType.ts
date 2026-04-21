import { ChatType } from "@/entities/chat/model/types";

export const mapChatTypeToValue = (type: ChatType | null, mode: "group" | "channel"): 1 | 2 => {
  if (!type) return 1; // Дефолтное значение

  if (mode === "group") {
    // 1 - Закрытая, 2 - Открытая
    return type === "private-group" ? 1 : 2;
  } else {
    // 1 - Публичный, 2 - Частный
    return type === "public-channel" ? 1 : 2;
  }
};

export const mapValueToChatType = (value: 1 | 2, mode: "group" | "channel"): ChatType => {
  if (mode === "group") {
    return value === 1 ? "private-group" : "public-group";
  } else {
    return value === 1 ? "public-channel" : "private-channel";
  }
};
