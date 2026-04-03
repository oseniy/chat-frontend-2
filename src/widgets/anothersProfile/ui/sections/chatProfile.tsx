"use client";

import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";

import { MappedChatDetails } from "@/entities/chat/lib/mapChat";
import { ChatParticipantListResponse } from "@/entities/chat/model/types";
import { Avatar } from "@/entities/chat/ui/avatar";
import { ChatInfoList } from "@/entities/chat/ui/chatInfoList";
import { ProfileNotifications } from "@/features/notifications/ui/profileNotifications";
import { pluralize } from "@/shared/lib/pluralize";
import { OurTabsList } from "@/shared/ourTabs/ourTabsList";
import { OurTabsTrigger } from "@/shared/ourTabs/ourTabsTrigger";
import { Tabs, TabsContent } from "@/shared/shadcn/ui/tabs";
import { SidebarContainer } from "@/shared/ui/sidebarContainer";

import { useAnothersProfileUIStore } from "../../model/anothersProfileUIStore";
import { FilesPage } from "../tabs/filesPage";
import { LinksPage } from "../tabs/linksPage";
import { MediaPage } from "../tabs/mediaPage";
import { ParticipantsPage } from "../tabs/participantsPage";
import { VoicesPage } from "../tabs/voicesPage";

type ChatProfileProps = {
  initialParticipants: ChatParticipantListResponse | null;
  initialData: MappedChatDetails | null;
  isOwner: boolean;
  isMobile: boolean;
  chatKey: string;
  canInvite: boolean;
};

export const ChatProfile: React.FC<ChatProfileProps> = ({
  initialData,
  isMobile,
  isOwner,
  initialParticipants,
  chatKey,
  canInvite,
}) => {
  const chatType =
    initialData?.type === "private-group" || initialData?.type === "public-group"
      ? "group"
      : "channel";
  const { activeTab, setActiveTab, setActiveSection } = useAnothersProfileUIStore(
    useShallow((s) => ({
      activeTab: s.activeTab,
      setActiveTab: s.setActiveTab,
      setActiveSection: s.setActiveSection,
    })),
  );
  const handleTabChange = useCallback(
    (value: string) => {
      setActiveSection("tab");
      setActiveTab(value as "participants" | "media" | "files" | "voices" | "links");
    },
    [setActiveSection, setActiveTab],
  );

  const getMembersLabel = () => {
    if (!initialData) return "";
    const count = initialData.membersCount + 1;
    if (chatType === "channel") {
      return `${count} ${pluralize(count, "подписчик", "подписчика", "подписчиков")}`;
    }
    return `${count} ${pluralize(count, "участник", "участника", "участников")}`;
  };

  if (!initialData) {
    return <div>Ошибка загрузки профиля</div>;
  }

  return (
    <>
      <SidebarContainer className="desktop:p-0 p-4" scrollbar={isMobile}>
        <div className="relative">
          <Avatar
            size="anothersProfileAvatar"
            className="flex w-full justify-center"
            avatarUrl={initialData?.avatar}
            variant="chat"
          />
          <div className="absolute bottom-3 left-4 text-white">
            <p className="title font-medium">{initialData?.title}</p>
            <p className="text">{getMembersLabel()}</p>
          </div>
        </div>
        <div className="flex flex-col items-start gap-4 px-4 pt-4 pb-2">
          <ProfileNotifications />
          <ChatInfoList initialData={initialData} isOwner={isOwner} />
        </div>
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <OurTabsList>
            <OurTabsTrigger value="participants">Участники</OurTabsTrigger>
            <OurTabsTrigger value="media">Медиа</OurTabsTrigger>
            <OurTabsTrigger value="files">Файлы</OurTabsTrigger>
            <OurTabsTrigger value="voices">Голосовые</OurTabsTrigger>
            <OurTabsTrigger value="links">Ссылки</OurTabsTrigger>
          </OurTabsList>
          <TabsContent value="participants">
            <ParticipantsPage
              canInvite={canInvite}
              initialParticipants={initialParticipants}
              chatKey={chatKey}
              chatType={chatType}
              isOwner={isOwner}
            />
          </TabsContent>
          <TabsContent value="media">
            <MediaPage />
          </TabsContent>
          <TabsContent value="files">
            <FilesPage />
          </TabsContent>
          <TabsContent value="voices">
            <VoicesPage />
          </TabsContent>
          <TabsContent value="links">
            <LinksPage />
          </TabsContent>
        </Tabs>
      </SidebarContainer>
    </>
  );
};
