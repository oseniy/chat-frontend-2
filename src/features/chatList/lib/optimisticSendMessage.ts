import { useChatListStore } from "../model/useChatListStore";

export const optimisticSendMessage = ({
  isFromMe,
  chatKey,
  message,
}: {
  isFromMe: boolean;
  chatKey: string;
  message: {
    id: number;
    uid: string;
    content: string;
    files_summary: { types: string[]; count: number };
    created_at: number;
    hasForwarded?: boolean;
    from_user_id: string;
  };
}) => {
  const unreadMessages = useChatListStore.getState().chatsByKey[chatKey]?.unreadMessages;
  console.log("optimisticSendMessage", message);
  useChatListStore.getState().patchChat(chatKey, {
    lastMessage: {
      id: message.id,
      uid: message.uid,
      content: message.content,
      created_at: message.created_at,
      updated_at: message.created_at,
      files_summary: message.files_summary,
      has_forwarded_message: message.hasForwarded,
      new: true,
      from_user: message.from_user_id,
    },
    lastActivityAt: message.created_at,
    unreadMessages: isFromMe ? 0 : unreadMessages + 1,
  });
};
