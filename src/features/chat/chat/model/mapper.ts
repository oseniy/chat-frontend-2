import { buildMessageBlocks } from "./messageBlock/buildMessageBlocks";
import {
  MappedChatMessage,
  MappedForwardedMessage,
  MappedMessageFile,
  MappedRepliedMessage,
} from "./types/mappedTypes";
import {
  ChatMessage,
  ChatMessageUI,
  ChatType,
  ForwardedMessage,
  MessageFile,
  RepliedMessage,
  UserProfile,
} from "./types/serverTypes";

export const mapUserProfile = (user: UserProfile) => ({
  uid: user.uid,
  username: user.username,
  nickname: user.nickname,
  firstName: user.first_name,
  lastName: user.last_name,
  patronymic: user.patronymic,
  avatar: user.avatar,
  avatarUrl: user.avatar_url,
  avatarWebp: user.avatar_webp,
  avatarWebpUrl: user.avatar_webp_url,
});

export const mapMessageFile = (file: MessageFile): MappedMessageFile => ({
  id: file.id,
  uid: file.uid,
  file: file.file,
  fileUrl:
    file.file_url === ""
      ? "/icons/imageLoader.svg"
      : file.file_url.includes("https://")
        ? file.file_url
        : `${process.env.NEXT_PUBLIC_API_URL}/${file.file_url}`,
  fileWebp: file.file_webp ?? null,
  fileWebpUrl: file.file_webp_url,
  fileType: file.file_type ?? null,
  isNew: file.new,
  createdAt: file.created_at,
  name: file.name ?? "",
  updatedAt: file.updated_at,
});

export const mapRepliedMessage = (message: RepliedMessage): MappedRepliedMessage => ({
  id: message.id,
  uid: message.uid,
  fromUserId: message.from_user,
  firstName: message.first_name,
  lastName: message.last_name,
  content: message.content,
  filesList: message.files_list.map(mapMessageFile),
});

export const mapForwardedMessage = (message: ForwardedMessage): MappedForwardedMessage => {
  return {
    id: message.id,
    uid: message.uid,
    fromUserId: message.from_user,
    avatarUrl: message.avatar,
    content: message.content,
    filesList: message.files_list.map(mapMessageFile),
    firstName: message.first_name,
    lastName: message.last_name,
  };
};

export const mapChatMessage = (message: ChatMessage | ChatMessageUI): MappedChatMessage => {
  const mappedMessage: MappedChatMessage = {
    id: message.id || 0,
    uid: message.uid,
    fromUser: mapUserProfile(message.from_user),
    toUser: message.to_user ? mapUserProfile(message.to_user) : null,
    content: message.content,
    repliedMessages: message.replied_messages?.map(mapRepliedMessage) || [],
    forwardedMessages: [],
    filesList: message.files_list?.map(mapMessageFile) || [],
    isNew: message.new,
    createdAt: message.created_at,
    updatedAt: message.updated_at,
    chatId: message.chat_id,
    chatKey: message.chat_key,
    chatType: message.chat_type as ChatType,
    messageRtc: message.message_rtc ?? null,
    status: (message as ChatMessageUI).status,
    requestUid: (message as ChatMessageUI).request_uid,
    avatar: null,
    blocks: [],
  };

  // 🔹 Форматируем пересланные в обычный контент
  if (message.forwarded_messages?.length) {
    mappedMessage.isForwarded = true;
    mappedMessage.forwardedChatId = message.forwarded_messages[0].from_user;
    mappedMessage.forwardedUid = message.forwarded_messages[0].uid;
    mappedMessage.forwardedAuthors = message.forwarded_messages.map((f) =>
      `${f.first_name || ""} ${f.last_name || ""}`.trim(),
    );
    mappedMessage.avatar =
      message.forwarded_messages[0].avatar || message.forwarded_messages[0].avatar_webp_url;

    // 🔹 текст пересланных НЕ включаем в content
    // если есть файлы, добавляем их
    const forwardedFiles = message.forwarded_messages.flatMap((f) =>
      f.files_list.map(mapMessageFile),
    );
    mappedMessage.filesList.push(...forwardedFiles);
  } else {
    mappedMessage.isForwarded = false;
    mappedMessage.forwardedAuthors = [];
    mappedMessage.avatar = null;
  }

  mappedMessage.blocks = buildMessageBlocks(mappedMessage);

  return mappedMessage;
};

export const mapChatMessages = (messages: (ChatMessage | ChatMessageUI)[]): MappedChatMessage[] =>
  messages.map(mapChatMessage);
