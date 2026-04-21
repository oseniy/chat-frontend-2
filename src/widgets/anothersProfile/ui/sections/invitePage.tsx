import { useMemo, useState } from "react";
import { useShallow } from "zustand/shallow";

import { addMembersToChat } from "@/entities/chat/api/addMemberToChat";
import { useParticipants } from "@/entities/chat/lib/useParticipants";
import { useContactsSync } from "@/entities/contact/lib/useContactsSync";
import { useContactStore } from "@/entities/contact/model/store";
import { Contact } from "@/entities/contact/model/types";
import { ContactCardFeature } from "@/features/contacts/ui/ContactCardFeature";
import { InviteToChatBtn } from "@/features/inviteToChat/ui/inviteToChatBtn";
import { useInfiniteScroll } from "@/shared/lib/useInfiniteScroll";
import { ContactsListEmpty } from "@/shared/ui/contactsListEmpty";
import { ListSeparator } from "@/shared/ui/listSeparator";
import { NoSearchResults } from "@/shared/ui/noSearchResults";
import { Searchbar } from "@/shared/ui/searchbar";

import { useInvitePageLogic } from "../../lib/useInvitePageLogic";
import { useAnothersProfileUIStore } from "../../model/anothersProfileUIStore";
import { useInviteSelectionStore } from "../../model/inviteSelectionStore";

type InvitePageProps = {
  chatKey: string;
};

export const InvitePage: React.FC<InvitePageProps> = ({ chatKey }) => {
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { fetchNextPage, hasNextPage, isFetchingNextPage } = useContactsSync();
  const { contacts, isInitialized } = useContactStore();
  const { participants } = useParticipants(chatKey);
  const { selectedContacts, toggle, clear } = useInviteSelectionStore(
    useShallow((s) => ({
      selectedContacts: s.selected,
      toggle: s.toggle,
      clear: s.clear,
    })),
  );
  const setActiveSection = useAnothersProfileUIStore((s) => s.setActiveSection);

  const participantUids = useMemo(() => new Set(participants.map((p) => p.uid)), [participants]);

  const availableContacts = useMemo(
    () => contacts.filter((c) => !participantUids.has(c.systemUid)),
    [contacts, participantUids],
  );

  const selectedUids = useMemo(
    () => new Set(selectedContacts.map((c) => c.uid)),
    [selectedContacts],
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
      await addMembersToChat({
        chat_key: chatKey,
        uid_users_list: selectedContacts.map((c: Contact) => c.systemUid),
      });

      clear();
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
            {logic.filteredLocalContacts.map((c) => {
              return (
                <ContactCardFeature
                  contact={c}
                  key={c.systemUid}
                  isSelecting
                  isChecked={selectedUids.has(c.uid)}
                  onToggle={toggle}
                />
              );
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
