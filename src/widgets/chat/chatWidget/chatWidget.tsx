"use client";

import { useEffect } from "react";

import { useCallStore } from "@/entities/call/model/useCallStore";
import { MappedChatDetails } from "@/entities/chat/lib/mapChat";
import { useChatInfoStore } from "@/entities/chat/model/useChatInfoStore";
import { UserPreview } from "@/entities/user/model/types";
import { useUserStore } from "@/entities/user/model/userStore";
import { normalizeChatInfo } from "@/features/chat/chat/lib/normalizeChatInfo";
import { ChatType } from "@/features/chat/chat/model/types/serverTypes";
import { cn } from "@/shared/shadcn/lib/utils";

import { Chat } from "../../../features/chat/chat/ui/chat";
import { ChatHeader } from "../chatHeader/ui/chatHeader";
import { getIsJoin } from "./lib/getIsJoin";

interface ChatWithParticipants {
  uid?: string;
  participants?: Array<{ uid: string }>;
}

type ChatWidgetProps = {
  className?: string;
  chatKey: string;
  chatType: ChatType;
  initialChatInfo: MappedChatDetails | UserPreview;
  chatUid: string;
  initialJoin?: boolean;
};

export const ChatWidget: React.FC<ChatWidgetProps> = ({
  className,
  initialChatInfo,
  chatType,
  chatKey,
  chatUid,
  initialJoin = false,
}) => {
  const makeCall = useCallStore((state) => state.makeCall);
  const storedChatInfo = useChatInfoStore((s) => s.chatInfoByKey[chatKey]);
  const userId = useUserStore((s) => s.userId);
  const join = userId !== null ? getIsJoin(storedChatInfo ?? initialChatInfo, userId) : initialJoin;
  const setChatInfo = useChatInfoStore((s) => s.setChatInfo);

  // Инициализируем стор начальными данными (только для групп/каналов)
  useEffect(() => {
    if ("type" in initialChatInfo) {
      setChatInfo(chatKey, initialChatInfo);
    }
  }, [chatKey, initialChatInfo, setChatInfo]);

  // Используем данные из стора, если есть, иначе из пропсов
  const chatInfo = normalizeChatInfo(storedChatInfo ?? initialChatInfo);
  const handleCall = () => {
    const chatData = initialChatInfo as ChatWithParticipants;

    // Приоритет: chatKeyUser -> участник -> прямой uid
    const targetUserId = chatType == "chat" ? chatKey : null;

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
          chatUid: chatUid,
          chatType: chatType,
        }}
        onCallClick={handleCall}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Chat
          chatKey={chatKey}
          chatType={chatType}
          createdBy={chatInfo.createdBy}
          join={join}
          chatUid={chatUid}
        />
      </div>
    </div>
  );
};
