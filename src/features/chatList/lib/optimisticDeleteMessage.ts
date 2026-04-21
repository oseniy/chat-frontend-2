import { useChatListStore } from "../model/useChatListStore";

export const optimisticDeleteMessage = (
  chatId: string,
  toUserId: string,
  lastMessageUid: string,
) => {
  const chats = useChatListStore.getState().chatsByKey;
  if (!chats) return;
  for (const chatKey in chats) {
    const chat = chats[chatKey];
    const currentChat =
      chat.type !== "chat" && chat.member.uid === toUserId
        ? chat
        : chat.type === "chat" && (chat.member.uid === chatId || chat.member.uid === toUserId)
          ? chat
          : null;

    if (currentChat) {
      useChatListStore.getState().patchChat(chatKey, {
        unreadMessages: Math.max(0, currentChat.unreadMessages - 1),
      });
    }
    if (currentChat && chat.lastMessage?.uid === lastMessageUid) {
      useChatListStore.getState().patchChat(chatKey, {
        lastMessage: {
          ...chat.lastMessage,
          files_summary: null,
          has_forwarded_message: false,
          has_replied_message: false,
          content: "Сообщение удалено",
          new: false,
        },
      });
    }
  }
};
