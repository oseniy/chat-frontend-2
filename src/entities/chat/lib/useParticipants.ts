"use client";

import { useMemo } from "react";

import { ChatParticipantListResponse } from "../model/types";
import { useParticipantsQuery } from "./useParticipantsQuery";

export const useParticipants = (
  chatKey: string,
  initialData?: ChatParticipantListResponse | null,
) => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isSuccess } =
    useParticipantsQuery(chatKey, initialData);

  const participants = useMemo(() => data?.pages.flatMap((page) => page.results) ?? [], [data]);

  const count = data?.pages[0]?.count ?? 0;
  const isInitialized = isSuccess;

  return {
    participants,
    count,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isInitialized,
  };
};
