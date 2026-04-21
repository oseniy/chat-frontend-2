import { getLastMessagePreview } from "@/entities/chat/lib/getLastMessagePreview";
import { useChatStore } from "@/entities/chat/model/useChatStore";
import { useCopyToClipboard } from "@/shared/copy/lib/useCopyToClipboard";

export const useCopySelectedMessages = (uids: string[]) => {
  const { messages } = useChatStore();
  const { copy } = useCopyToClipboard();

  return async () => {
    let finalMessage = "";

    uids.forEach((uid) => {
      const message = messages.find((msg) => msg.uid === uid);
      if (!message) return;

      const author = message.fromUser.firstName
        ? `${message.fromUser.firstName} ${message.fromUser.lastName}`
        : message.fromUser.nickname;

      const content =
        message.content && message.content.trim() !== ""
          ? message.content
          : getLastMessagePreview({
              content: message.content,
              files: {
                count: message?.filesList.length || 0,
                types:
                  message?.filesList
                    .map((file) => file.fileType)
                    .filter((t): t is string => Boolean(t)) || [],
              },
            }).text;
      finalMessage += `${author}\n${content}\n\n`;
    });

    if (finalMessage) {
      await copy(finalMessage.trim());
    }
  };
};
