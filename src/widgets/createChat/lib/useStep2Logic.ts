import { useEffect, useMemo } from "react";

import { Contact } from "@/entities/contact/model/types";

import { useStep2SelectionStore } from "../model/step2SelectionStore";

type UseStep2LogicProps = {
  contacts: Contact[];
  search: string;
  isInitialized: boolean;
};

export const useStep2Logic = ({ contacts, search, isInitialized }: UseStep2LogicProps) => {
  const isSearching = search.trim().length > 0;

  const filteredLocalContacts = useMemo(() => {
    if (!isSearching) return contacts;
    const query = search.toLowerCase();
    return contacts.filter(
      (c) =>
        c.fullName?.toLowerCase().includes(query) ||
        c.phone.includes(query) ||
        c.nickname?.toLowerCase().includes(query) ||
        c.username?.toLowerCase().includes(query),
    );
  }, [contacts, search, isSearching]);

  useEffect(() => {
    return () => useStep2SelectionStore.getState().clear();
  }, []);

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
  };
};
