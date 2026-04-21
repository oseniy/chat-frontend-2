import { ChatType } from "@/entities/chat/model/types";
import { useChatStore } from "@/entities/chat/model/useChatStore";
import { useChatListStore } from "@/features/chatList/model/useChatListStore";

import { deleteMessageUseCase } from "./deleteMessage.useCase";

type DeleteMessagesBulkParams = {
  messageIds: string[];
  chatKey: string;
  chatType: ChatType;
  chatKeyUser?: string | null;
  forAll: boolean;
};

export const deleteMessagesBulkUseCase = async ({
  messageIds,
  chatKey,
  chatType,
  chatKeyUser,
  forAll,
}: DeleteMessagesBulkParams) => {
  const { messages, currentUserId } = useChatStore.getState();
  const { chatsByKey } = useChatListStore.getState();
  const messagesMap = new Map(messages.map((m) => [m.uid, m]));

  await Promise.all(
    messageIds.map((id) => {
      const msg = messagesMap.get(id);
      if (!msg) return;

      const canForAll = msg.fromUser.uid === currentUserId;

      return deleteMessageUseCase({
        messageId: id,
        chatKey,
        fromUserId: msg.fromUser.uid,
        toUserId: msg.toUser?.uid,
        lastMessageId: chatsByKey[chatKey]?.lastMessage?.uid,
        chatType,
        chatKeyUser,
        forAll: forAll && canForAll,
      });
    }),
  );
};
