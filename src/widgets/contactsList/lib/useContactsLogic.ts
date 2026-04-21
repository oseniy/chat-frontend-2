import { useMemo } from "react";

import { Contact } from "@/entities/contact/model/types";

type UseContactsLogicProps = {
  contacts: Contact[];
  globalUsers: Contact[];
  search: string;
  isLoading: boolean;
  isInitialized: boolean;
  isSelecting: boolean;
};

export const useContactsLogic = ({
  contacts,
  globalUsers,
  search,
  isLoading,
  isInitialized,
  isSelecting,
}: UseContactsLogicProps) => {
  const isSearching = search.trim().length > 0;

  // Сортировка контактов: сначала онлайн, затем по убыванию lastSeenAt
  const sortedContacts = useMemo(() => {
    return [...contacts].sort((a, b) => {
      if (a.isOnline !== b.isOnline) return a.isOnline ? -1 : 1;
      return (b.lastSeenAt ?? 0) - (a.lastSeenAt ?? 0);
    });
  }, [contacts]);

  // Фильтрация локальных контактов
  const filteredLocalContacts = useMemo(() => {
    if (!isSearching) return sortedContacts;
    const query = search.toLowerCase();
    return sortedContacts.filter(
      (c) =>
        c.fullName?.toLowerCase().includes(query) ||
        c.phone.includes(query) ||
        c.nickname?.toLowerCase().includes(query) ||
        c.username?.toLowerCase().includes(query),
    );
  }, [sortedContacts, search, isSearching]);

  // Фильтрация глобальных (исключаем тех, кто уже в контактах)
  const filteredGlobalUsers = useMemo(() => {
    if (isSelecting) return [];
    return globalUsers.filter(
      (globalUser) =>
        !contacts.some(
          (contact) => contact.systemUid === globalUser.uid || contact.uid === globalUser.uid,
        ),
    );
  }, [globalUsers, contacts]);

  // Вычисляемые состояния для UI
  const showLocalContacts =
    filteredLocalContacts.length > 0 || (!isSearching && contacts.length > 0);
  const showGlobalSearchResults = isSearching && filteredGlobalUsers.length > 0;
  const showNoResults =
    isSearching &&
    filteredLocalContacts.length === 0 &&
    filteredGlobalUsers.length === 0 &&
    !isLoading;

  const isInitialEmpty = !isSearching && contacts.length === 0 && isInitialized;
  const showLoader = !isInitialized || isLoading;

  return {
    isSearching,
    filteredLocalContacts,
    filteredGlobalUsers,
    showLocalContacts,
    showGlobalSearchResults,
    showNoResults,
    isInitialEmpty,
    showLoader,
  };
};
