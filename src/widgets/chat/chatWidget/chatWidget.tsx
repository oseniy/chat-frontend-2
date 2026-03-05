"use client";

// Импортируем стор звонков
import { useCallStore } from "@/entities/call/model/useCallStore";
import { MappedChatDetails } from "@/entities/chat/lib/mapChat";
import { UserPreview } from "@/entities/user/model/types";
import { normalizeChatInfo } from "@/features/chat/chat/lib/normalizeChatInfo";
import { ChatType } from "@/features/chat/chat/model/types/serverTypes";
import { cn } from "@/shared/shadcn/lib/utils";

import { MappedChatMessage } from "../../../features/chat/chat/model/types/mappedTypes";
import { Chat } from "../../../features/chat/chat/ui/chat";
import { ChatHeader } from "../chatHeader/ui/chatHeader";

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
  // Достаем функцию начала звонка
  const makeCall = useCallStore((state) => state.makeCall);

  const chatInfo = normalizeChatInfo(initialChatInfo);

  const chatName = chatInfo.title || chatInfo.firstName || "Unknown";
  const chatAvatar = chatInfo.avatar || chatInfo.avatarUrl || "";

  // Функция-обработчик клика по трубке
  const handleCall = () => {
    // В личных чатах используем chatKey или chatKeyUser как ID собеседника
    const targetId = chatType === "chat" ? chatKeyUser || chatKey : chatKey;

    if (targetId) {
      makeCall(targetId);
    }
  };

  return (
    <div className={cn("desktop:h-full flex h-dvh w-full flex-col", className)}>
      <ChatHeader
        profileHref={`/chats/${chatKey}/profile`}
        backHref="/chats"
        chat={{
          name: chatName,
          photo: chatAvatar,
          wasOnlineAt: chatInfo.wasOnlineAt,
          isOnline: chatInfo.isOnline,
          membersCount: chatInfo.membersCount,
          chatType: chatType,
        }}
        // Передаем нашу функцию в хедер
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
