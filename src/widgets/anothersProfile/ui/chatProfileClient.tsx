"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import { MappedChatDetails } from "@/entities/chat/lib/mapChat";
import { ChatParticipantListResponse, ChatTypeLight } from "@/entities/chat/model/types";
import { useChatInfoStore } from "@/entities/chat/model/useChatInfoStore";
import { useUserStore } from "@/entities/user/model/userStore";
import { useIsMobileStore } from "@/shared/model/isMobile.store";
import { SidebarHeader } from "@/shared/ui/sidebarHeader/sidebarHeader";

import { getProfileHeaderText } from "../lib/getProfileHeaderText";
import { useChatProfileContextMenu } from "../lib/useChatProfileContextMenu";
import { useProfileClose } from "../lib/useProfileClose";
import { useAnothersProfileUIStore } from "../model/anothersProfileUIStore";

// eslint-disable-next-line @typescript-eslint/naming-convention
const ChatProfile = dynamic(
  () => import("./sections/chatProfile").then((m) => ({ default: m.ChatProfile })),
  { ssr: false },
);
import { ChatSettingsPage } from "./sections/chatSettingsPage";
import { InvitePage } from "./sections/invitePage";
import { FilesPage } from "./tabs/filesPage";
import { LinksPage } from "./tabs/linksPage";
import { MediaPage } from "./tabs/mediaPage";
import { ParticipantsPage } from "./tabs/participantsPage";
import { VoicesPage } from "./tabs/voicesPage";

type ChatProfileClientProps = {
  chatKey: string;
  chatType: ChatTypeLight;
  chatInfo: MappedChatDetails | null;
  initialParticipants: ChatParticipantListResponse | null;
};

export const ChatProfileClient: React.FC<ChatProfileClientProps> = ({
  chatKey,
  chatType,
  chatInfo,
  initialParticipants,
}) => {
  const { activeSection, activeTab, setActiveTab, resetTabsUI, setActiveSection } =
    useAnothersProfileUIStore(
      useShallow((s) => ({
        activeSection: s.activeSection,
        activeTab: s.activeTab,
        setActiveTab: s.setActiveTab,
        resetTabsUI: s.reset,
        setActiveSection: s.setActiveSection,
      })),
    );
  const isMobile = useIsMobileStore((state) => state.isMobile);
  const sidebarHeaderText = getProfileHeaderText({ chatType, activeSection, activeTab });
  const closeProfile = useProfileClose();
  const currentUserUid = useUserStore((s) => s.userId);
  const cachedChatInfo = useChatInfoStore((s) => s.chatInfoByKey[chatKey]);

  useEffect(() => {
    if (chatInfo && !useChatInfoStore.getState().chatInfoByKey[chatKey]) {
      useChatInfoStore.getState().setChatInfo(chatKey, chatInfo);
    }
    setActiveTab("participants");
    return () => resetTabsUI();
  }, [chatKey, chatInfo]);

  const displayData = cachedChatInfo ?? chatInfo;

  const isOwner = currentUserUid === displayData?.createdBy;

  const contextMenu = useChatProfileContextMenu({
    isOwner,
    chatType,
    chatKey,
    chatName: displayData?.title || "",
    fullChatType: displayData?.type || "chat",
    chatId: displayData?.id || null,
  });

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
        settings={isOwner}
        onSettingsClick={() => {
          setActiveSection("settings");
        }}
      />
      {activeSection === "main" ? (
        <ChatProfile
          initialData={displayData}
          isMobile={isMobile}
          isOwner={isOwner}
          chatKey={chatKey}
          initialParticipants={initialParticipants}
          canInvite={isOwner}
        />
      ) : activeSection === "settings" ? (
        <ChatSettingsPage chatKey={chatKey} chatInfo={displayData} />
      ) : activeSection === "invite" ? (
        <InvitePage chatKey={chatKey} />
      ) : (
        (() => {
          switch (activeTab) {
            case "participants":
              return (
                <ParticipantsPage
                  chatType={chatType}
                  initialParticipants={initialParticipants}
                  chatKey={chatKey}
                  canInvite={isOwner}
                  isOwner={isOwner}
                />
              );
            case "media":
              return <MediaPage />;
            case "files":
              return <FilesPage />;
            case "voices":
              return <VoicesPage />;
            case "links":
              return <LinksPage />;
            default:
              return <MediaPage />;
          }
        })()
      )}
    </>
  );
};
