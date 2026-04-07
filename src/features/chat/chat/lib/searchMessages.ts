import { useMessageNavigation } from "../model/store/useChatNavigationStore";
import { searchMessagePosition } from "./searchMessagePosition";

export const searchMessages = async ({
  userUid,
  query,
  page = 0,
}: {
  userUid: string;
  query: string;
  page?: number;
}) => {
  const result = await searchMessagePosition({
    userUid,
    query,
    type: "content",
  });

  if (!result.success) return;

  const first = result.data?.[page];
  if (!first) return;

  useMessageNavigation.getState().navigate(first.uid, first.page, query);
  return result.data ?? [];
};
