"use client";

import { useEffect } from "react";

import { ChatParticipantListResponse } from "../model/types";
import { useParticipantsStore } from "../model/useParticipantsStore";
import { useParticipantsQuery } from "./useParticipantsQuery";

export const useParticipantsSync = (
  chatKey: string,
  initialData?: ChatParticipantListResponse | null,
) => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useParticipantsQuery(
    chatKey,
    initialData,
  );
  const setParticipants = useParticipantsStore((s) => s.setParticipants);
  const reset = useParticipantsStore((s) => s.reset);

  useEffect(() => {
    reset();
  }, [chatKey, reset]);

  useEffect(() => {
    if (!data) return;

    // Сплющиваем все страницы из TanStack Query
    const allFetchedParticipants = data.pages.flatMap((page) => page.results);
    const totalCount = data.pages[0]?.count ?? 0;

    // Обновляем стор
    setParticipants(allFetchedParticipants, totalCount);
  }, [data, setParticipants]);

  return {
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  };
};
