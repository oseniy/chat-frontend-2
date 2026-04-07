"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { SearchMessageResponse } from "@/features/chat/chat/lib/searchMessagePosition";
import { searchMessages } from "@/features/chat/chat/lib/searchMessages";
import { useMessageNavigation } from "@/features/chat/chat/model/store/useChatNavigationStore";
import { ChatType } from "@/features/chat/chat/model/types/serverTypes";
import { SearchbarMessages } from "@/features/chat/chat/ui/searchbarMessages";
import { useJoinToChat } from "@/features/joinToChat/lib/useJoinToChat";
import { useDebouncedValue } from "@/shared/lib/hooks/useDebounceValue";
import { cn } from "@/shared/shadcn/lib/utils";
import { BackButton } from "@/shared/ui/backButton";

import { ChatHeaderActions } from "./chatHeaderActions";
import { ChatHeaderUser } from "./chatHeaderUser";

type Props = {
  chat: {
    name: string;
    wasOnlineAt?: number | null;
    isOnline?: boolean | null;
    membersCount?: number;
    chatType: ChatType;
    chatUid: string;
    photo: string | null;
  };
  join?: boolean;
  chatKey?: string;
  backHref: string;
  profileHref: string;
};

export const ChatHeader = ({ chat, backHref, profileHref, join, chatKey }: Props) => {
  const [searchValue, setSearch] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const token = useSearchParams()?.get("token") ?? undefined;
  const { onJoin, isLoading, setIsLoading } = useJoinToChat({
    chatKey,
    token,
    chatType: chat.chatType,
  });

  const [results, setResults] = useState<SearchMessageResponse[]>([]);
  const [resultsCount, setResultsCount] = useState(0);
  const [page, setPage] = useState(1);

  const resetSearch = useMessageNavigation((s) => s.resetSearch);
  const resetNavigationStore = useMessageNavigation((s) => s.reset);

  const debounceSearch = useDebouncedValue(searchValue, 400);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    resetSearch();
    resetNavigationStore();
    setPage(1);
  };

  useEffect(() => {
    const runSearch = async () => {
      if (!debounceSearch.trim()) {
        setResults([]);
        setResultsCount(0);
        resetSearch();
        resetNavigationStore();
        return;
      }

      const data = await searchMessages({
        userUid: chat.chatUid,
        query: debounceSearch,
      });

      if (!data) {
        setResults([]);
        setResultsCount(0);
        resetSearch();
        resetNavigationStore();
        return;
      }

      setResults(data);
      setResultsCount(data.length);
      setPage(1);

      if (data.length > 0) {
        const first = data[0];

        useMessageNavigation.getState().navigate(first.uid, first.page, debounceSearch);
      }
    };

    runSearch();
  }, [debounceSearch, chat.chatUid]);

  const handlePageChange = (direction: number) => {
    if (!results.length) return;

    const nextPage = Math.min(Math.max(1, page + direction), results.length);
    setPage(nextPage);

    const target = results[nextPage - 1];
    if (!target) return;

    useMessageNavigation.getState().navigate(target.uid, target.page, searchValue);
  };

  const onSearchClick = () => {
    setIsSearchOpen(!isSearchOpen);
    setSearch("");
    setResults([]);
    setResultsCount(0);
    resetNavigationStore();
  };

  const onCloseSearchClick = () => {
    setIsSearchOpen(false);
    setSearch("");
    setResults([]);
    setResultsCount(0);
    resetSearch();
    resetNavigationStore();
  };

  const onCallClick = () => {};

  return (
    <div className="flex flex-col">
      <header className="desktop:bg-main-light-gray desktop:border-muted desktop:rounded-t-lg desktop:border-b relative flex h-[60px] items-center justify-between px-4">
        <BackButton
          href={backHref}
          className="desktop:hidden mr-6 shrink-0"
          width={12}
          height={20}
        />

        <Link
          href={profileHref}
          className="flex w-full min-w-0 flex-1 items-center justify-between gap-3"
        >
          <ChatHeaderUser
            chatType={chat.chatType}
            name={chat.name}
            photo={chat.photo}
            isOnline={chat.isOnline}
            membersCount={chat.membersCount}
            wasOnlineAt={chat.wasOnlineAt}
            isInfoHidden={isSearchOpen}
          />
        </Link>

        <SearchbarMessages
          value={searchValue}
          onChange={handleSearchChange}
          onPageChange={handlePageChange}
          onClose={onCloseSearchClick}
          disablePrev={searchValue === "" || page === 1}
          disableNext={resultsCount === 0 || page === resultsCount}
          isSearchOpen={isSearchOpen}
          className={cn(isSearchOpen ? "flex w-full pl-3" : "hidden")}
        />

        <ChatHeaderActions
          onCallClick={onCallClick}
          onSearchClick={onSearchClick}
          onJoin={onJoin}
          join={join}
          chatType={chat.chatType}
          isLoading={isLoading}
          className={cn(isSearchOpen ? "hidden" : "flex")}
          setIsLoading={setIsLoading}
        />
      </header>

      {isSearchOpen && searchValue && (
        <div className="bg-primary-accent-light text-gray subtext flex items-center justify-start px-4 py-2">
          Результаты: {resultsCount > 0 ? `${page} из ${resultsCount}` : "0"}
        </div>
      )}
    </div>
  );
};
