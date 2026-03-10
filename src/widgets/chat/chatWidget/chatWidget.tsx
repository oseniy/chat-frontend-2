"use client";
import { useCallStore } from "@/entities/call/model/useCallStore";
import { MappedChatDetails } from "@/entities/chat/lib/mapChat";
import { UserPreview } from "@/entities/user/model/types";
import { normalizeChatInfo } from "@/features/chat/chat/lib/normalizeChatInfo";
import { ChatType } from "@/features/chat/chat/model/types/serverTypes";
import { cn } from "@/shared/shadcn/lib/utils";

import { MappedChatMessage } from "../../../features/chat/chat/model/types/mappedTypes";
import { Chat } from "../../../features/chat/chat/ui/chat";
import { ChatHeader } from "../chatHeader/ui/chatHeader";

interface ChatWithParticipants {
  uid?: string;
  participants?: Array<{ uid: string }>;
}

type ChatWidgetProps = {
  className?: string;
  chatKey: string;
  chatKeyUser: string | null;
  chatType: ChatType;
  initialChatInfo: MappedChatDetails | UserPreview;
  initialMessages: MappedChatMessage[];
};

export const ChatWidget: React.FC<ChatWidgetProps> = ({
  className,
  initialChatInfo,
  chatType,
  initialMessages,
  chatKey,
  chatKeyUser,
}) => {
  const makeCall = useCallStore((state) => state.makeCall);
  const chatInfo = normalizeChatInfo(initialChatInfo);

  const handleCall = () => {
    const chatData = initialChatInfo as ChatWithParticipants;
    const participants = Array.isArray(chatData?.participants) ? chatData.participants : [];
    const pUid = participants.find((p) => p.uid && !p.uid.startsWith("chat_"))?.uid;

    // Приоритет: chatKeyUser -> участник -> прямой uid
    const targetUserId =
      (chatKeyUser && !chatKeyUser.startsWith("chat_") ? chatKeyUser : null) ||
      pUid ||
      (chatData?.uid && !chatData.uid.startsWith("chat_") ? chatData.uid : null);

    if (targetUserId) {
      console.warn("📞 Звоним на UID:", targetUserId);
      makeCall(targetUserId);
    } else {
      console.error("❌ UID не найден", chatData);
    }
  };

  return (
    <div className={cn("desktop:h-full flex h-dvh w-full flex-col", className)}>
      <ChatHeader
        profileHref={`/chats/${chatKey}/profile`}
        backHref="/chats"
        chat={{
          name: chatInfo.title || chatInfo.firstName || "Chat",
          photo: chatInfo.avatar || chatInfo.avatarUrl || "",
          wasOnlineAt: chatInfo.wasOnlineAt,
          isOnline: chatInfo.isOnline,
          membersCount: chatInfo.membersCount,
          chatType: chatType,
        }}
        onCallClick={handleCall}
        onSearchClick={() => {}}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Chat
          initialMessages={initialMessages}
          chatKey={chatKey}
          chatType={chatType}
          chatKeyUser={chatKeyUser}
          createdBy={chatInfo.createdBy}
        />
      </div>
    </div>
  );
};
