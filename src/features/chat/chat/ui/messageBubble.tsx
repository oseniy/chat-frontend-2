import { memo, useCallback } from "react";

import { Avatar } from "@/entities/chat/ui/avatar";
import { cn } from "@/shared/shadcn/lib/utils";
import { Checkbox } from "@/shared/ui/checkbox";

import { useChatStore } from "../../../../entities/chat/model/useChatStore";
import { useMessageContextMenu } from "../lib/useMessageContextMenu";
import { useMessageNavigation } from "../model/store/useChatNavigationStore";
import { MappedChatMessage } from "../model/types/mappedTypes";
import { MessageLayout } from "./messageLayout";

type MessageBubbleProps = {
  className?: string;
  chatMessage: MappedChatMessage;
  currentUserId: string;
  isFirstInGroup?: boolean;
  isLastInGroup?: boolean;
  isGroupChat: boolean;
  isChannel: boolean;
  [key: `data-${string}`]: string | undefined;
};

const messageBubbleComponent = memo(
  ({
    className,
    chatMessage,
    currentUserId,
    isFirstInGroup,
    isLastInGroup,
    isGroupChat,
    isChannel,
    ...dataAttributes
  }: MessageBubbleProps) => {
    const isMine = chatMessage.fromUser.uid === currentUserId;
    const { isSelectionMode, selectedMessageUids, toggleMessageSelection } = useChatStore();
    const isSelected = selectedMessageUids.has(chatMessage.uid);

    const { onContextMenu, isOpen } = useMessageContextMenu(chatMessage);

    const isHighlighted = useMessageNavigation(
      useCallback((s) => s.highlightMessageId === chatMessage.uid, [chatMessage.uid]),
    );
    // В каналах имя отправителя не показываем
    const showSenderName = !isMine && isGroupChat && isFirstInGroup && !isChannel;

    // Место под аватарку резервируем только в группах (не в личках и не в каналах)
    const shouldShowSideContent = !isMine && isGroupChat && !isChannel;

    return (
      <div
        className={cn(
          "flex w-full min-w-0 flex-1 items-center transition-colors duration-300 ease-out",
          (isSelected || isHighlighted || isOpen) && "bg-muted",
          className,
        )}
        {...dataAttributes}
      >
        {isSelectionMode && (
          <Checkbox
            checked={isSelected}
            onChange={() => toggleMessageSelection(chatMessage.uid)}
            className="ml-4 shrink-0"
          />
        )}

        {shouldShowSideContent && (
          <div className="ml-4 flex w-8 shrink-0 items-end self-stretch pb-0.5">
            {isLastInGroup ? (
              <Avatar size="s" avatarUrl={chatMessage.fromUser.avatarUrl} />
            ) : (
              <div className="w-8" aria-hidden="true" />
            )}
          </div>
        )}

        <div
          id={`msg-${chatMessage.uid}`}
          className={cn(
            "flex min-w-0 flex-1 px-4 transition-colors duration-300 ease-out select-none",
            isMine ? "justify-end" : "justify-start",
            // Если контента слева нет (личка/канал), добавляем стандартный паддинг
            !shouldShowSideContent && !isMine && "pl-4",
          )}
          onClick={() => isSelectionMode && toggleMessageSelection(chatMessage.uid)}
          onContextMenu={onContextMenu}
        >
          <MessageLayout
            isMine={isMine}
            message={chatMessage}
            blocks={chatMessage.blocks}
            showSenderName={showSenderName}
          />
        </div>
      </div>
    );
  },
);

messageBubbleComponent.displayName = "MessageBubble";

export const MessageBubble = messageBubbleComponent;
export default MessageBubble;
