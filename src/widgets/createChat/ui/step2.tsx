import { useMemo, useState } from "react";
import { useShallow } from "zustand/shallow";

import { useContactsSync } from "@/entities/contact/lib/useContactsSync";
import { useContactStore } from "@/entities/contact/model/store";
import { ContactCardFeature } from "@/features/contacts/ui/ContactCardFeature";
import { SubmitCreateChatBtn } from "@/features/createChat/ui/submitCreateChatBtn";
import { useInfiniteScroll } from "@/shared/lib/useInfiniteScroll";
import { ContactsListEmpty } from "@/shared/ui/contactsListEmpty";
import { ListSeparator } from "@/shared/ui/listSeparator";
import { NoSearchResults } from "@/shared/ui/noSearchResults";
import { Searchbar } from "@/shared/ui/searchbar";

import { useStep2Logic } from "../lib/useStep2Logic";
import { useStep2SelectionStore } from "../model/step2SelectionStore";

type Step2WidgetProps = {
  className?: string;
};

export const Step2Widget: React.FC<Step2WidgetProps> = () => {
  const [search, setSearch] = useState("");
  const { fetchNextPage, hasNextPage, isFetchingNextPage } = useContactsSync();
  const { contacts, isInitialized } = useContactStore();
  const { selected, toggle } = useStep2SelectionStore(
    useShallow((s) => ({ selected: s.selected, toggle: s.toggle })),
  );
  const selectedUids = useMemo(() => new Set(selected.map((c) => c.uid)), [selected]);
  const logic = useStep2Logic({
    contacts,
    isInitialized,
    search,
  });
  const loadMoreRef = useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage,
    isSearching: logic.isSearching,
    fetchNextPage,
  });

  return (
    <div className="flex h-full flex-col justify-between gap-4">
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
      <SubmitCreateChatBtn />
    </div>
  );
};
