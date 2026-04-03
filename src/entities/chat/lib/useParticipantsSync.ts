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

    // Проверяем дубли
    const uids = allFetchedParticipants.map((p) => p.uid);
    const duplicates = uids.filter((uid, i) => uids.indexOf(uid) !== i);
    console.warn(
      "[useParticipantsSync] Синхронизация query→store, всего:",
      uids.length,
      "дубли:",
      duplicates,
      "pages count:",
      data.pages.length,
    );
    if (duplicates.length > 0) {
      console.warn("[useParticipantsSync] ДУБЛИКАТЫ НАЙДЕНЫ! uids:", duplicates);
      data.pages.forEach((page, i) => {
        console.warn(
          `[useParticipantsSync] Page ${i}: count=${page.count}, results uids:`,
          page.results.map((r) => r.uid),
        );
      });
    }

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
