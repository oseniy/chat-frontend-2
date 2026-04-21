import { useInfiniteQuery } from "@tanstack/react-query";

import { ChatParticipantListResponse } from "../model/types";
import { getParticipants } from "./getParticipants";

export const useParticipantsQuery = (
  chatKey: string,
  initialData?: ChatParticipantListResponse | null,
) => {
  return useInfiniteQuery({
    queryKey: ["participants", chatKey],
    queryFn: ({ pageParam }) => getParticipants(chatKey, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.next ?? undefined,
    // Если данные пришли с сервера, используем их для мгновенной отрисовки
    initialData: initialData ? { pages: [initialData], pageParams: [undefined] } : undefined,
    retry: 1,
    staleTime: 1000 * 30,
  });
};
