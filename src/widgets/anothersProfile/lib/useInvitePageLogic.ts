import { useMemo } from "react";

import { Contact } from "@/entities/contact/model/types";

import { useInviteSelectionStore } from "../model/inviteSelectionStore";

type UseInvitePageLogicProps = {
  contacts: Contact[];
  search: string;
  isInitialized: boolean;
};

export const useInvitePageLogic = ({
  contacts,
  search,
  isInitialized,
}: UseInvitePageLogicProps) => {
  const selectedContacts = useInviteSelectionStore((s) => s.selected);
  const isSelected = selectedContacts.length > 0;
  const isSearching = search.trim().length > 0;

  const filteredLocalContacts = useMemo(() => {
    console.log("contacts", contacts);
    if (!isSearching) return contacts;
    const query = search.toLowerCase();
    return contacts.filter(
      (c) =>
        c.fullName?.toLowerCase().includes(query) ||
        c.nickname?.toLowerCase().includes(query) ||
        c.phone.includes(query) ||
        c.nickname?.toLowerCase().includes(query) ||
        c.username?.toLowerCase().includes(query),
    );
  }, [contacts, search, isSearching]);

  const showLocalContacts =
    filteredLocalContacts.length > 0 || (!isSearching && contacts.length > 0);
  const showNoResults = isSearching && filteredLocalContacts.length === 0;

  const isInitialEmpty = !isSearching && contacts.length === 0 && isInitialized;
  const showLoader = !isInitialized;

  return {
    isSearching,
    filteredLocalContacts,
    showLocalContacts,
    showNoResults,
    isInitialEmpty,
    showLoader,
    isSelected,
  };
};
