import { useMemo, useState } from "react";

import { useParticipantsSync } from "@/entities/chat/lib/useParticipantsSync";
import { ChatParticipantListResponse } from "@/entities/chat/model/types";
import { useParticipantsStore } from "@/entities/chat/model/useParticipantsStore";
import { ToInvitePageBtn } from "@/features/inviteToChat/ui/toInvitePageBtn";
import { useInfiniteScroll } from "@/shared/lib/useInfiniteScroll";
import { Searchbar } from "@/shared/ui/searchbar";

import { filterParticipants } from "../../lib/filterParticipants";
import { ParticipantCard } from "../participantCard";

type ParticipantsPageProps = {
  className?: string;
  chatKey: string;
  initialParticipants: ChatParticipantListResponse | null;
  chatType: "group" | "channel" | "chat";
  canInvite: boolean;
  isOwner: boolean;
};

export const ParticipantsPage: React.FC<ParticipantsPageProps> = ({
  className,
  initialParticipants,
  chatKey,
  chatType,
  canInvite,
  isOwner,
}) => {
  const [search, setSearch] = useState("");
  const { fetchNextPage, hasNextPage, isFetchingNextPage } = useParticipantsSync(
    chatKey,
    initialParticipants,
  );

  const participants = useParticipantsStore((s) => s.participants);

  const loadMoreRef = useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  });
  const filtered = useMemo(() => filterParticipants(participants, search), [participants, search]);

  return (
    <div className="flex w-full flex-col p-2">
      <div className="flex w-full flex-col items-start gap-4 p-2">
        {canInvite && <ToInvitePageBtn chatType={chatType} />}
        <Searchbar className="w-full" value={search} onChange={setSearch} />
      </div>
      {search ? (
        filtered.map((p, index) => (
          <ParticipantCard
            key={p.uid}
            participant={p}
            chatKey={chatKey}
            isLast={index === filtered.length - 1}
            isOwner={isOwner && !p.isOwner}
            className={className}
          />
        ))
      ) : (
        <>
          {participants.length > 0 && (
            <>
              <p className="text-gray minitext p-3">Владелец</p>
              <ParticipantCard
                participant={participants[0]}
                chatKey={chatKey}
                isLast={participants.length === 1}
                isOwner={false}
                className={className}
              />
            </>
          )}
          {participants.length > 1 && (
            <>
              <p className="text-gray minitext p-3">
                {chatType === "group" ? "Участники" : "Подписчики"}
              </p>
              {participants.slice(1).map((p, index) => (
                <ParticipantCard
                  key={p.uid}
                  participant={p}
                  chatKey={chatKey}
                  isLast={index + 1 === participants.length - 1}
                  isOwner={isOwner}
                  className={className}
                />
              ))}
            </>
          )}
        </>
      )}
      {hasNextPage && (
        <div ref={loadMoreRef} className="flex flex-col justify-center py-4">
          {isFetchingNextPage && <p className="text-sm text-gray-400">Загрузка...</p>}
        </div>
      )}
    </div>
  );
};
