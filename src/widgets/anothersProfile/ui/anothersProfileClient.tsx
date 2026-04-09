"use client";

import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import { ChatTypeLight } from "@/entities/chat/model/types";
import { ContactListResponse } from "@/entities/contact/model/types";
import { User } from "@/entities/user/model/types";
import { useUserInfoStore } from "@/entities/user/model/useUserInfoStore";
import { useChatListStore } from "@/features/chatList/model/useChatListStore";
import { useIsMobileStore } from "@/shared/model/isMobile.store";
import { SidebarHeader } from "@/shared/ui/sidebarHeader/sidebarHeader";

import { getProfileHeaderText } from "../lib/getProfileHeaderText";
import { useAnothersProfileContextMenu } from "../lib/useAnothersProfileContextMenu";
import { useProfileClose } from "../lib/useProfileClose";
import { useAnothersProfileUIStore } from "../model/anothersProfileUIStore";
import { AnothersProfile } from "./sections/anothersProfile";
import { FilesPage } from "./tabs/filesPage";
import { LinksPage } from "./tabs/linksPage";
import { MediaPage } from "./tabs/mediaPage";
import { VoicesPage } from "./tabs/voicesPage";

type AnothersProfileClientProps = {
  chatType: ChatTypeLight;
  chatInfo: User | null;
  contacts: ContactListResponse | null;
  chatKey?: string;
};

export const AnothersProfileClient: React.FC<AnothersProfileClientProps> = ({
  chatType,
  chatInfo,
  contacts,
  chatKey: chatKeyProp,
}) => {
  const { activeSection, activeTab, setActiveTab, resetTabsUI } = useAnothersProfileUIStore(
    useShallow((s) => ({
      activeSection: s.activeSection,
      activeTab: s.activeTab,
      setActiveTab: s.setActiveTab,
      resetTabsUI: s.reset,
    })),
  );
  const isMobile = useIsMobileStore((state) => state.isMobile);
  const sidebarHeaderText = getProfileHeaderText({ chatType, activeSection, activeTab });
  const closeProfile = useProfileClose();

  const cachedUserInfo = useUserInfoStore((s) =>
    chatInfo ? s.userInfoByUid[chatInfo.uid] : undefined,
  );

  useEffect(() => {
    if (chatInfo) {
      useUserInfoStore.getState().setUserInfo(chatInfo.uid, chatInfo);
    }
    setActiveTab("media");
    return () => resetTabsUI();
  }, [chatInfo]);

  const displayData = cachedUserInfo ?? chatInfo;

  // Извлекаем ID чата: сначала из данных пользователя, если нет — из chatKeyProp
  const chatId = displayData?.id || (chatKeyProp ? parseInt(chatKeyProp, 10) : null);

  console.log("--- ОТЛАДКА ОЧИСТКИ ---");
  console.log("chatKeyProp:", chatKeyProp);
  console.log("displayData ID:", displayData?.id);
  console.log("Данные из стора:", useChatListStore.getState().chatsByKey[chatKeyProp || ""]);

  const contextMenu = useAnothersProfileContextMenu({
    chatId: chatId && !isNaN(chatId as number) ? (chatId as number) : null,
    chatName: displayData?.fullName ?? "",
  });

  const tabs: Record<string, React.ReactNode> = {
    media: <MediaPage chatKey={chatKeyProp} />,
    files: <FilesPage />,
    voices: <VoicesPage />,
    links: <LinksPage />,
  };

  if (!displayData) {
    return <div>Ошибка загрузки профиля</div>;
  }

  return (
    <>
      <SidebarHeader
        title={sidebarHeaderText}
        closeButton={!isMobile && activeSection === "main"}
        closeButtonFn={closeProfile}
        backButtonFn={closeProfile}
        backButton={isMobile || !(activeSection === "main")}
        contextMenu={contextMenu}
      />
      {activeSection === "main" ? (
        <AnothersProfile
          initialData={displayData}
          contactsInitialData={contacts}
          isMobile={isMobile}
          chatKey={chatKeyProp}
        />
      ) : (
        tabs[activeTab] || <LinksPage />
      )}
    </>
  );
};
