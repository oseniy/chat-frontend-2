import { InfiniteData, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useShallow } from "zustand/shallow";

import { addMembersToChat } from "@/entities/chat/api/addMemberToChat";
import { ChatParticipantListResponse } from "@/entities/chat/model/types";
import { useParticipantsStore } from "@/entities/chat/model/useParticipantsStore";
import { useContactsSync } from "@/entities/contact/lib/useContactsSync";
import { useContactStore } from "@/entities/contact/model/store";
import { useSelectContactsStore } from "@/features/contacts/model/SelectContactsStore";
import { ContactCardFeature } from "@/features/contacts/ui/ContactCardFeature";
import { InviteToChatBtn } from "@/features/inviteToChat/ui/inviteToChatBtn";
import { useInfiniteScroll } from "@/shared/lib/useInfiniteScroll";
import { ContactsListEmpty } from "@/shared/ui/contactsListEmpty";
import { ListSeparator } from "@/shared/ui/listSeparator";
import { NoSearchResults } from "@/shared/ui/noSearchResults";
import { Searchbar } from "@/shared/ui/searchbar";

import { useInvitePageLogic } from "../../lib/useInvitePageLogic";
import { useAnothersProfileUIStore } from "../../model/anothersProfileUIStore";

type InvitePageProps = {
  chatKey: string;
};

export const InvitePage: React.FC<InvitePageProps> = ({ chatKey }) => {
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const { fetchNextPage, hasNextPage, isFetchingNextPage } = useContactsSync();
  const { contacts, isInitialized } = useContactStore();
  const participants = useParticipantsStore((s) => s.participants);
  const selectedContacts = useSelectContactsStore(useShallow((s) => s.selected));
  const setActiveSection = useAnothersProfileUIStore((s) => s.setActiveSection);

  const participantUids = useMemo(() => new Set(participants.map((p) => p.uid)), [participants]);

  const availableContacts = useMemo(
    () => contacts.filter((c) => !participantUids.has(c.systemUid)),
    [contacts, participantUids],
  );

  const logic = useInvitePageLogic({
    contacts: availableContacts,
    isInitialized,
    search,
  });
  const loadMoreRef = useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage,
    isSearching: logic.isSearching,
    fetchNextPage,
  });

  const handleInvite = async () => {
    if (!chatKey || selectedContacts.length === 0) return;

    setIsLoading(true);
    try {
      const response = await addMembersToChat({
        chat_key: chatKey,
        uid_users_list: selectedContacts.map((c) => c.systemUid),
      });

      const addedUids = new Set(response.added_users.map((u) => u.uid));
      const addedCount = addedUids.size;

      const newParticipants = selectedContacts
        .filter((c) => addedUids.has(c.systemUid))
        .map((c) => ({
          uid: c.systemUid,
          firstName: c.firstName,
          lastName: c.lastName,
          fullName: c.fullName ?? `${c.firstName} ${c.lastName}`.trim(),
          avatarUrl: c.avatarUrl,
          avatarWebpUrl: c.avatarWebpUrl,
          isDeleted: false,
          isOwner: false,
          isBlocked: false,
          isOnline: c.isOnline,
          lastSeenAt: c.lastSeenAt,
          isInContacts: true,
        }));

      queryClient.setQueryData(
        ["participants", chatKey],
        (oldData: InfiniteData<ChatParticipantListResponse> | undefined) => {
          if (!oldData) return oldData;
          const [firstPage, ...restPages] = oldData.pages;
          return {
            ...oldData,
            pages: [
              {
                ...firstPage,
                count: (firstPage?.count ?? 0) + addedCount,
                results: [...(firstPage?.results ?? []), ...newParticipants],
              },
              ...restPages,
            ],
          };
        },
      );

      // Инвалидируем кэш для фоновой синхронизации с сервером
      queryClient.invalidateQueries({ queryKey: ["participants", chatKey] });

      setActiveSection("main");
    } catch {
      alert("Ошибка при добавлении пользователей");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col justify-between gap-4 p-4">
      <Searchbar value={search} onChange={setSearch} />
      <div className="scrollbar-hover flex h-full flex-col overflow-x-hidden overflow-y-auto">
        {logic.showLocalContacts && (
          <div className="flex flex-col gap-2">
            <ListSeparator text="Мои контакты" />
            {logic.filteredLocalContacts.map((c, index) => {
              return <ContactCardFeature contact={c} key={index} />;
            })}
          </div>
        )}
        {!logic.isSearching && hasNextPage && (
          <div ref={loadMoreRef} className="flex justify-center py-4">
            {isFetchingNextPage && <p className="text-sm text-gray-400">Загрузка...</p>}
          </div>
        )}
        {logic.showNoResults && (
          <div className="flex flex-1 items-center justify-center">
            <NoSearchResults />
          </div>
        )}
        {logic.isInitialEmpty && (
          <div className="flex flex-1 items-center justify-center">
            <ContactsListEmpty />
          </div>
        )}
      </div>
      <InviteToChatBtn disabled={!logic.isSelected} isLoading={isLoading} onClick={handleInvite} />
    </div>
  );
};
