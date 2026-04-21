import { v4 as uuidv4 } from "uuid";

import { deleteTextMessage } from "@/entities/chat/api/deleteMessage";
import { useChatStore } from "@/entities/chat/model/useChatStore";
import { ChatType } from "@/features/chat/chat/model/types/serverTypes";

type DeleteMessageParams = {
  messageId: string;
  chatKey: string;
  chatType: ChatType;
  fromUserId: string;
  toUserId?: string;
  lastMessageId?: string;
  chatKeyUser?: string | null;
  forAll: boolean;
};

export const deleteMessageUseCase = async ({
  messageId,
  chatKey,
  chatType,
  chatKeyUser,
  forAll,
}: DeleteMessageParams) => {
  const { deleteMessage } = useChatStore.getState();
  deleteMessage(messageId);

  try {
    await deleteTextMessage({
      uid: messageId,
      chat_key: chatType === "chat" ? chatKeyUser! : chatKey,
      for_all: forAll,
      request_uid: uuidv4(),
    });
  } catch (error) {
    console.error("deleteMessageUseCase error:", error);
  }
};
