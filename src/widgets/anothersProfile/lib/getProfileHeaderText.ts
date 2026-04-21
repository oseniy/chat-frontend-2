import { ChatTypeLight } from "@/entities/chat/model/types";

const CHAT_TYPE_LABELS: Record<ChatTypeLight, string> = {
  chat: "Информация",
  channel: "Информация о канале",
  group: "Информация о группе",
};

interface ProfileHeaderTextArgs {
  chatType: ChatTypeLight;
  activeSection: string;
  activeTab: string;
}

export const getProfileHeaderText = ({
  chatType,
  activeSection,
  activeTab,
}: ProfileHeaderTextArgs): string => {
  if (activeSection === "main") {
    return CHAT_TYPE_LABELS[chatType];
  } else if (activeSection === "settings") {
    return "Настройки";
  } else if (activeSection === "invite" && chatType == "group") {
    return "Добавить участников";
  } else if (activeSection === "invite" && chatType == "channel") {
    return "Добавить подписчиков";
  } else {
    return activeTab === "participants" ? "Участники" : "Вложения";
  }
};
