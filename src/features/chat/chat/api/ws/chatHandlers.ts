import { ChatListItem } from "@/entities/chat/model/types";
import { useChatStore } from "@/entities/chat/model/useChatStore";
import { useUserStore } from "@/entities/user/model/userStore";
import { optimisticDeleteMessage } from "@/features/chatList/lib/optimisticDeleteMessage";
import { optimisticSendMessage } from "@/features/chatList/lib/optimisticSendMessage";
import { useChatListStore } from "@/features/chatList/model/useChatListStore";
import { WSHandler } from "@/shared/api/ws/model/types";

import { mapChatMessage } from "../../model/mapper";
import { ChatMessage, ChatMessageUI } from "../../model/types/serverTypes";

export const handleCreateTextMessage: WSHandler = (data) => {
  if (!data.object) return;

  const chatStore = useChatStore.getState();
  const chatListStore = useChatListStore.getState();

  const currentUserId = useUserStore.getState().userId;
  const chatKey = chatStore.chatKey;

  if (!currentUserId) return;

  const newMessage = mapChatMessage(data.object as ChatMessageUI);
  const isMine = newMessage.fromUser.uid === currentUserId;

  const isCurrentChat =
    (newMessage.chatType === "chat" &&
      (isMine ? newMessage.toUser?.uid === chatKey : newMessage.fromUser.uid === chatKey)) ||
    (newMessage.chatType !== "chat" && newMessage.chatKey === chatKey);

  if (isCurrentChat) {
    const tempIndex = chatStore.messages.findIndex((msg) => msg.requestUid === data.request_uid);
    if (tempIndex !== -1) {
      const updated = [...chatStore.messages];
      updated[tempIndex] = newMessage;
      if (newMessage.chatType === "chat") {
        useChatStore.setState({ chatKeyUser: newMessage.chatKey });
      }
      useChatStore.setState({ messages: updated });
    } else if (!chatStore.messages.some((msg) => msg.uid === newMessage.uid)) {
      chatStore.addMessage(newMessage);
    }
  }

  const existingChat = chatListStore.chatsByKey[newMessage.chatKey];

  if (!existingChat && newMessage.chatType !== "chat") {
    chatListStore.addNewChat(newMessage.chatKey);
  } else if (!existingChat && newMessage.chatType === "chat") {
    const newChat: ChatListItem = {
      id: +newMessage.chatKey.slice(5),
      key: newMessage.chatKey,
      title: "",
      type: newMessage.chatType,
      member: {
        uid: newMessage.fromUser.uid,
        nickname: isMine ? newMessage.toUser?.nickname || "" : newMessage.fromUser?.nickname,
        username: isMine ? newMessage.toUser?.username || "" : newMessage.fromUser?.username,
        first_name: isMine ? newMessage.toUser?.firstName || "" : newMessage.fromUser?.firstName,
        last_name: isMine ? newMessage.toUser?.lastName : newMessage.fromUser?.lastName,

        avatar: isMine ? newMessage.toUser?.avatarUrl : newMessage.fromUser?.avatarUrl,
        avatar_url: isMine ? newMessage.toUser?.avatarUrl : newMessage.fromUser?.avatarUrl,
        avatar_webp: isMine ? newMessage.toUser?.avatarUrl : newMessage.fromUser?.avatarUrl,

        is_blocked: false,
        is_online: true,
        was_online_at: Date.now(),
        is_in_contacts: false,
      },
      lastMessage: {
        id: newMessage.id || 0,
        uid: newMessage.uid,
        content: newMessage.content,
        created_at: newMessage.createdAt,
        has_forwarded_message: newMessage.forwardedMessages.length > 0,
        has_replied_message: newMessage.repliedMessages.length > 0,
        files_summary: {
          count: newMessage.filesList.length,
          types: newMessage.filesList
            ? newMessage.filesList.map((f) => f.fileType).filter((t): t is string => t !== null)
            : [],
        },
        updated_at: newMessage.createdAt,
        new: true,
        from_user: newMessage.fromUser.uid,
      },
      lastActivityAt: newMessage.createdAt,
      avatar: {
        jpg: isMine ? newMessage.toUser?.avatarUrl : newMessage.fromUser?.avatarUrl,
      },
      unreadMessages: 1,
      unreadFiles: 0,
      notificationsEnabled: true,
      isFavorite: false,
    };

    chatListStore.upsertChat(newChat);
  } else if (!isMine) {
    optimisticSendMessage({
      isFromMe: false,
      chatKey: newMessage.chatKey,
      message: {
        id: newMessage.id,
        uid: newMessage.uid,
        hasForwarded: newMessage.isForwarded,
        files_summary: {
          count: newMessage.filesList.length,
          types: newMessage.filesList
            ? newMessage.filesList.map((f) => f.fileType).filter((t): t is string => t !== null)
            : [],
        },
        content: newMessage.content,
        created_at: newMessage.createdAt,
        from_user_id: newMessage.fromUser.uid,
      },
    });
  }
};

type WSChatData = {
  chat_data: {
    chat_key: string;
  };
};

export const handleReadStatus: WSHandler = (data) => {
  if (!data.object) return;
  const obj = data.object as WSChatData;
  const chatKey = obj.chat_data.chat_key;

  const updatedMsg = mapChatMessage(data.object as ChatMessage);
  if (!updatedMsg.uid) return;

  useChatStore.setState((state) => ({
    messages: state.messages.map((msg) =>
      msg.uid === updatedMsg.uid ? { ...msg, isNew: false } : msg,
    ),
  }));

  const currentChat = useChatListStore.getState().chatsByKey[chatKey || ""];

  if (!currentChat) return;
  const patch: Partial<ChatListItem> = {
    unreadMessages: Math.max(0, currentChat.unreadMessages - 1),
  };

  if (currentChat.lastMessage) {
    patch.lastMessage = {
      ...currentChat.lastMessage,
      new: updatedMsg.id === currentChat.lastMessage?.id ? false : true,
    };
  }

  useChatListStore.getState().patchChat(chatKey, patch);

  console.log("handleReadStatus patched", useChatListStore.getState().chatsByKey[chatKey]);

  return;
};

export type WSDeleteMessageData = {
  uid: string;
  from_user?: { uid: string };
  to_user?: { uid: string };
};

/* eslint-disable @typescript-eslint/no-explicit-any */
export const handleDeleteMessage: WSHandler<any> = (data) => {
  const payload = data.object as WSDeleteMessageData;

  if (!payload || !payload.from_user || !payload.uid) return;

  useChatStore.getState().deleteMessage(payload.uid);
  optimisticDeleteMessage(payload.from_user.uid || "", payload.to_user?.uid || "", payload.uid);
};
