import { InfiniteData } from "@tanstack/react-query";

import { getQueryClient } from "@/shared/api/getQueryClient";

import { ChatParticipant, ChatParticipantListResponse } from "../model/types";

type ParticipantsData = InfiniteData<ChatParticipantListResponse> | undefined;

const participantsKey = (chatKey: string) => ["participants", chatKey];

export const addParticipantsToCache = (chatKey: string, items: ChatParticipant[]) => {
  if (items.length === 0) return;

  getQueryClient().setQueryData(participantsKey(chatKey), (oldData: ParticipantsData) => {
    if (!oldData) return oldData;

    const existingUids = new Set(oldData.pages.flatMap((page) => page.results.map((p) => p.uid)));
    const uniqueItems = items.filter((p) => !existingUids.has(p.uid));
    if (uniqueItems.length === 0) return oldData;

    const [firstPage, ...restPages] = oldData.pages;

    return {
      ...oldData,
      pages: [
        {
          ...firstPage,
          count: (firstPage?.count ?? 0) + uniqueItems.length,
          results: [...(firstPage?.results ?? []), ...uniqueItems],
          next: firstPage?.next ?? null,
        },
        ...restPages,
      ],
    };
  });
};

export const removeParticipantsFromCache = (chatKey: string, uids: string[]) => {
  if (uids.length === 0) return;

  const uidSet = new Set(uids);

  getQueryClient().setQueryData(participantsKey(chatKey), (oldData: ParticipantsData) => {
    if (!oldData) return oldData;

    let removedTotal = 0;
    const pages = oldData.pages.map((page) => {
      const filtered = page.results.filter((p) => !uidSet.has(p.uid));
      removedTotal += page.results.length - filtered.length;
      return { ...page, results: filtered };
    });

    if (removedTotal === 0) return oldData;

    return {
      ...oldData,
      pages: pages.map((page, i) => ({
        ...page,
        count: i === 0 ? Math.max(0, page.count - removedTotal) : page.count,
      })),
    };
  });
};

export const updateParticipantInCache = (
  chatKey: string,
  uid: string,
  patch: Partial<ChatParticipant>,
) => {
  getQueryClient().setQueryData(participantsKey(chatKey), (oldData: ParticipantsData) => {
    if (!oldData) return oldData;

    return {
      ...oldData,
      pages: oldData.pages.map((page) => ({
        ...page,
        results: page.results.map((p) => (p.uid === uid ? { ...p, ...patch } : p)),
      })),
    };
  });
};

export const updateParticipantsInCache = (
  chatKey: string,
  updater: (participant: ChatParticipant) => ChatParticipant,
) => {
  getQueryClient().setQueryData(participantsKey(chatKey), (oldData: ParticipantsData) => {
    if (!oldData) return oldData;

    return {
      ...oldData,
      pages: oldData.pages.map((page) => ({
        ...page,
        results: page.results.map(updater),
      })),
    };
  });
};
