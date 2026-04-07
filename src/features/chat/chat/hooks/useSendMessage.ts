import { useCallback } from "react";
import { v4 as uuidv4 } from "uuid";

import { sendTextMessage } from "@/entities/chat/api/sendMessage";
import { optimisticSendMessage } from "@/features/chatList/lib/optimisticSendMessage";
import { MESSAGE_STATUS } from "@/shared/constants/constants";

import { useChatStore } from "../../../../entities/chat/model/useChatStore";
import { mapChatMessage } from "../model/mapper";
import { PendingFile } from "../model/store/useChatSendFilesStore";
import { PendingImage } from "../model/store/useChatSendImagesStore";
import { ChatMessageUI, ChatType } from "../model/types/serverTypes";

export const useSendMessage = () => {
  const {
    currentUserId,
    chatKey,
    chatKeyUser,
    chatType,
    addMessage,
    setFailedStatus,
    replyTarget,
    forwardTargets,
    setForwardTargets,
    setReplyTarget,
  } = useChatStore();

  const sendSingleMessage = useCallback(
    async (
      text: string,
      images: PendingImage[] = [],
      files: PendingFile[] = [],
      forwardMsgUid?: string,
    ) => {
      if (!currentUserId || !chatKey) return;

      const forwardTarget = forwardMsgUid
        ? forwardTargets.find((msg) => msg.uid === forwardMsgUid)
        : null;

      const requestUid = uuidv4();
      const now = Date.now() / 1000;

      const tempId = Number(`-${Date.now()}${Math.floor(Math.random() * 1000)}`);

      const tempServerMessage: ChatMessageUI = {
        id: tempId,
        uid: uuidv4(),

        from_user: {
          uid: currentUserId,
          username: "",
          nickname: "",
          first_name: "",
          last_name: "",
          patronymic: "",
          avatar: "",
          avatar_url: "",
          avatar_webp: "",
          avatar_webp_url: "",
        },

        to_user: null,

        content: text || " ",

        replied_messages: replyTarget
          ? [
              {
                id: replyTarget.id,
                uid: replyTarget.uid,
                from_user: replyTarget.fromUser.uid,
                first_name: replyTarget.fromUser.firstName,
                last_name: replyTarget.fromUser.lastName,
                content: replyTarget.content,
                files_list: replyTarget.filesList.map((f) => ({
                  id: f.id,
                  uid: f.uid,
                  file: typeof f.file === "string" ? f.file : "",
                  file_url: f.fileUrl,
                  file_webp: f.fileWebp ?? null,
                  file_webp_url: f.fileWebpUrl,
                  file_type: f.fileType,
                  new: true,
                  created_at: f.createdAt,
                  updated_at: f.updatedAt,
                })),
              },
            ]
          : [],

        forwarded_messages:
          forwardMsgUid && forwardTarget
            ? [
                {
                  id: forwardTarget.id,
                  uid: forwardMsgUid,
                  from_user: forwardTarget.fromUser.uid,
                  first_name: forwardTarget.fromUser.firstName,
                  avatar_webp_url: forwardTarget.fromUser.avatarWebpUrl || "",
                  last_name: forwardTarget.fromUser.lastName,
                  avatar:
                    forwardTarget.fromUser.avatarUrl || forwardTarget.fromUser.avatarWebpUrl || "",
                  content: forwardTarget.content,
                  files_list: forwardTarget.filesList.map((f) => ({
                    id: f.id,
                    uid: f.uid,
                    file: typeof f.file === "string" ? f.file : "",
                    file_url: f.fileUrl,
                    file_webp: f.fileWebp ?? null,
                    file_webp_url: f.fileWebpUrl,
                    file_type: f.fileType,
                    new: true,
                    created_at: f.createdAt,
                    updated_at: f.updatedAt,
                  })),
                },
              ]
            : [],

        files_list: [
          ...images.map((img) => ({
            id: img.id,
            uid: `${img.id}-${uuidv4()}`,
            file: img.file,
            file_url: "",
            file_webp: null,
            file_webp_url: "",
            file_type: "image/png",
            new: true,
            created_at: now,
            updated_at: now,
          })),
          ...files.map((file) => ({
            id: Number(file.id),
            uid: `${file.id}-${uuidv4()}`,
            file: file.file,
            name: file.file.name,
            file_url: "",
            file_type: file.type,
            file_webp: null,
            new: true,
            created_at: now,
            updated_at: now,
          })),
        ],

        new: true,
        created_at: now,
        updated_at: now,

        chat_id: "",
        chat_key: chatType === "chat" ? chatKeyUser || chatKey : chatKey,
        chat_type: chatType as ChatType,

        message_rtc: null,

        status: MESSAGE_STATUS.PENDING,
        request_uid: requestUid,
      };

      const tempMessage = mapChatMessage(tempServerMessage);

      addMessage(tempMessage);
      setReplyTarget(null);

      const allFiles = [...images.map((i) => i.file), ...files.map((f) => f.file)];

      const filesPayload = await Promise.all(
        allFiles.map(async (file) => {
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve((reader.result as string).split(",")[1]);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
          return { filename: file.name, data: base64 };
        }),
      );

      optimisticSendMessage({
        isFromMe: true,
        chatKey: tempMessage.chatKey,
        message: {
          id: tempMessage.id,
          uid: tempMessage.uid,
          content: tempMessage.content,
          files_summary: {
            types: images.map((f) => f.type).concat(files.map((f) => f.type)),
            count: tempMessage.filesList.length,
          },
          hasForwarded: !!forwardMsgUid,
          created_at: now,
          from_user_id: currentUserId,
        },
      });

      try {
        const serverMessage = await sendTextMessage({
          chat_key: chatType !== "chat" ? chatKey : null,
          to_user_uid: chatType === "chat" ? chatKey : null,
          content: text,
          files: filesPayload,
          status: "publish",
          replied_messages: replyTarget?.uid ? [replyTarget.uid] : [],
          forwarded_messages: forwardMsgUid ? [forwardMsgUid] : [],
          request_uid: requestUid,
        });

        const mapped = mapChatMessage(serverMessage);
        mapped.status = MESSAGE_STATUS.DELIVERED;
        mapped.requestUid = requestUid;

        const chatState = useChatStore.getState();
        const tempIndex = chatState.messages.findIndex((m) => m.requestUid === requestUid);

        if (tempIndex !== -1) {
          const updated = [...chatState.messages];
          updated[tempIndex] = mapped;
          useChatStore.setState({ messages: updated });
        } else {
          addMessage(mapped);
        }

        optimisticSendMessage({
          isFromMe: true,
          chatKey: mapped.chatKey,
          message: {
            id: mapped.id,
            uid: mapped.uid,
            content: mapped.content,
            files_summary: {
              types: mapped.filesList.map((f) => f.fileType).filter((t): t is string => t !== null),
              count: mapped.filesList.length,
            },
            hasForwarded: serverMessage.forwarded_messages.length > 0,
            created_at: mapped.createdAt,
            from_user_id: mapped.fromUser.uid,
          },
        });
      } catch (error) {
        console.error(error);
        setFailedStatus(requestUid);
      }
    },
    [
      currentUserId,
      chatKey,
      chatType,
      chatKeyUser,
      addMessage,
      setFailedStatus,
      replyTarget,
      forwardTargets,
      useChatStore,
    ],
  );

  return useCallback(
    async (text: string, images: PendingImage[] = [], files: PendingFile[] = []) => {
      if (forwardTargets.length > 0) {
        const tasks: Promise<void>[] = [];

        if (text.trim().length > 0) {
          tasks.push(sendSingleMessage(text, [], []));
        }

        for (const forwardMsg of forwardTargets) {
          tasks.push(sendSingleMessage(forwardMsg.content, [], [], forwardMsg.uid));
        }

        await Promise.all(tasks);

        setForwardTargets([]);
        return;
      }

      if (images.length) {
        await sendSingleMessage(text, images, []);
        return;
      }

      if (files.length) {
        const tasks: Promise<void>[] = [];

        if (text.trim().length > 0) {
          tasks.push(sendSingleMessage(text, [], []));
        }

        for (const file of files) {
          tasks.push(sendSingleMessage("", [], [file]));
        }

        await Promise.all(tasks);
        return;
      }

      await sendSingleMessage(text, [], []);
    },
    [sendSingleMessage, forwardTargets, setForwardTargets],
  );
};
