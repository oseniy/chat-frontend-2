import React, { memo } from "react";

import { getMessageMarginTop } from "../lib/getMessageMarginTop";
import { MappedChatMessage } from "../model/types/mappedTypes";
import { DateBadge } from "./dateBage";
import { MessageBubble } from "./messageBubble";

type MessageGroupProps = {
  label: string;
  messages: MappedChatMessage[];
  currentUserId: string;
  passDataAttributes?: boolean;
  chatId?: number;
  isGroup?: boolean;
};

const messageGroupComponent = memo(
  ({
    label,
    messages,
    currentUserId,
    chatId,
    isGroup = false,
    passDataAttributes = false,
  }: MessageGroupProps) => {
    const firstMsg = messages[0];
    const isChannel =
      firstMsg?.chatType === "public-channel" || firstMsg?.chatType === "private-channel";
    return (
      <div className="flex w-full flex-col">
        <DateBadge label={label} className="desktop:mb-5 mb-3" />
        {messages.map((msg, idx) => {
          const prev = messages[idx - 1];
          const next = messages[idx + 1];

          const isFirstInGroup = isGroup && msg.fromUser.uid !== prev?.fromUser.uid;
          const isLastInGroup = isGroup && msg.fromUser.uid !== next?.fromUser.uid;

          const marginTop = getMessageMarginTop(msg, prev);
          return (
            <MessageBubble
              key={msg.uid}
              className={marginTop}
              chatMessage={msg}
              currentUserId={currentUserId}
              isFirstInGroup={isFirstInGroup}
              isLastInGroup={isLastInGroup}
              isGroupChat={isGroup}
              isChannel={isChannel}
              {...(passDataAttributes && {
                "data-message-uid": msg.uid,
                "data-message-id": msg.id,
                "data-chat-id": chatId,
                "data-chat-key": msg.chatKey,
                "data-is-from-current-user": String(msg.fromUser.uid === currentUserId),
                "data-is-new": String(msg.isNew),
              })}
            />
          );
        })}
      </div>
    );
  },
);

messageGroupComponent.displayName = "MessageGroup";

export const MessageGroup = messageGroupComponent;
export default MessageGroup;
