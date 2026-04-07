import { parseInviteUrl } from "@/entities/chat/lib/parseInviteUrl";
import { MappedChatMessage } from "@/features/chat/chat/model/types/mappedTypes";
import { AUDIO_TYPES, FILE_TYPES, IMAGE_TYPES } from "@/features/chatList/model/constants";

import { MessageBlock } from "./types";

export const buildMessageBlocks = (msg: MappedChatMessage): MessageBlock[] => {
  const blocks: MessageBlock[] = [];

  if (msg.repliedMessages?.length > 0) {
    const r = msg.repliedMessages[0];
    blocks.push({
      type: "reply",
      messageUid: r.uid,
      authorName: r.firstName + " " + r.lastName,
      content: r.content,
      filesList: r.filesList,
    });
  }

  if (msg.filesList?.length > 0) {
    if (
      msg.filesList.filter((f) => IMAGE_TYPES.some((t) => t.includes(f.fileType || ""))).length > 0
    ) {
      blocks.push({
        type: "media",
        items: msg.filesList.map((file) => ({
          id: file.id,
          type: "image",
          src: file.fileUrl,
        })),
      });
    } else if (
      msg.filesList.filter((f) => AUDIO_TYPES.some((t) => t.includes(f.fileType || ""))).length > 0
    ) {
      blocks.push({
        type: "audio",
        item: msg.filesList.map((file) => ({
          id: file.id,
          type: "audio",
          src: file.fileUrl,
        })),
      });
    } else if (
      msg.filesList.filter((f) => FILE_TYPES.some((t) => t.includes(f.fileType || ""))).length > 0
    ) {
      blocks.push({
        type: "file",
        items: msg.filesList.map((file) => ({
          id: String(file.id),
          type: FILE_TYPES.some((t) => t.includes(file.fileType || "")) ? "document" : "audio",
          fileType: file.fileType || "",
          title: file.name || file.fileUrl.split("/").pop(),
          src: file.fileUrl,
        })),
      });
    }
  }

  if (msg.content) {
    const inviteData = parseInviteUrl(msg.content);
    if (inviteData) {
      blocks.push({
        type: "inviteLink",
        chatKey: inviteData.chatKey,
        token: inviteData.token,
      });
    }

    blocks.push({
      type: "text",
      text: msg.content,
    });
  }

  return blocks;
};
