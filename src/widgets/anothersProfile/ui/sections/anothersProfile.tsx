"use client";

import { useCallback, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { Avatar } from "@/entities/chat/ui/avatar";
import { useContactsSync } from "@/entities/contact/lib/useContactsSync";
import { useIsInContact } from "@/entities/contact/lib/useIsInContact";
import { ContactListResponse } from "@/entities/contact/model/types";
import { User } from "@/entities/user/model/types";
import { UserInfoList } from "@/entities/user/ui/UserInfoList";
import { ChatType } from "@/features/chat/chat/model/types/serverTypes";
import { AddedToContactsModal } from "@/features/contacts/addToContacts/ui/AddedToContactsModal";
import { AddToContactsProfileBtn } from "@/features/contacts/addToContacts/ui/addToContactsProfileBtn";
import { ProfileNotifications } from "@/features/notifications/ui/profileNotifications";
import { OurTabsList } from "@/shared/ourTabs/ourTabsList";
import { OurTabsTrigger } from "@/shared/ourTabs/ourTabsTrigger";
import { Tabs, TabsContent } from "@/shared/shadcn/ui/tabs";
import { SidebarContainer } from "@/shared/ui/sidebarContainer";
import { Statusbar } from "@/shared/ui/statusbar/ui/statusbar";

import { useAnothersProfileUIStore } from "../../model/anothersProfileUIStore";
import { FilesPage } from "../tabs/filesPage";
import { LinksPage } from "../tabs/linksPage";
import { MediaPage } from "../tabs/mediaPage";
import { VoicesPage } from "../tabs/voicesPage";

type AnothersProfileProps = {
  initialData: User | null;
  contactsInitialData?: ContactListResponse | null;
  isMobile: boolean;
  chatKey?: string;
};

export const AnothersProfile: React.FC<AnothersProfileProps> = ({
  initialData,
  contactsInitialData,
  isMobile,
  chatKey,
}) => {
  const { activeTab, setActiveTab, setActiveSection } = useAnothersProfileUIStore(
    useShallow((s) => ({
      activeTab: s.activeTab,
      setActiveTab: s.setActiveTab,
      setActiveSection: s.setActiveSection,
    })),
  );
  const [showModal, setShowModal] = useState(false);
  useContactsSync(contactsInitialData);
  const isInContact = useIsInContact(initialData?.uid ?? "");

  const handleModalClose = useCallback(() => {
    setShowModal(false);
  }, []);

  const handleAddToContactsSuccess = useCallback(() => {
    setShowModal(true);
  }, []);

  const handleTabChange = (value: string) => {
    setActiveSection("tab");
    setActiveTab(value as "participants" | "media" | "files" | "voices" | "links");
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
            avatarUrl={initialData?.avatarUrl}
            variant="user"
          />
          <div className="absolute bottom-3 left-4 text-white">
            <p className="title font-medium">{initialData?.fullName}</p>
            <Statusbar
              isOnline={initialData?.isOnline}
              chatType={"direct" as ChatType}
              time={initialData?.lastSeenAt ?? null}
              className="text-white"
            />
          </div>
        </div>
        <div className="flex flex-col items-start gap-4 px-4 pt-4 pb-6">
          <ProfileNotifications />
          <UserInfoList initialData={initialData} />
          {initialData && !isInContact && (
            <AddToContactsProfileBtn
              phone={initialData.username}
              firstName={initialData.firstName}
              lastName={initialData.lastName}
              onSuccess={handleAddToContactsSuccess}
            />
          )}
        </div>
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <OurTabsList>
            <OurTabsTrigger value="media">Медиа</OurTabsTrigger>
            <OurTabsTrigger value="files">Файлы</OurTabsTrigger>
            <OurTabsTrigger value="voices">Голосовые</OurTabsTrigger>
            <OurTabsTrigger value="links">Ссылки</OurTabsTrigger>
          </OurTabsList>
          <TabsContent value="media">
            <MediaPage chatKey={chatKey} />
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
      {initialData && (
        <AddedToContactsModal
          isOpen={showModal}
          onClose={handleModalClose}
          firstName={initialData.firstName}
          lastName={initialData.lastName}
        />
      )}
    </>
  );
};
