import Image from "next/image";

import { getLastMessagePreview } from "@/entities/chat/lib/getLastMessagePreview";
import { useChatStore } from "@/entities/chat/model/useChatStore";
import { FILE_TYPES, IMAGE_TYPES } from "@/features/chatList/model/constants";
import { truncateFileName } from "@/shared/lib/truncateFilename";
import { cn } from "@/shared/shadcn/lib/utils";
import { FileIcon } from "@/shared/ui/fileList/fileIcon";

import { ReplyBlock } from "../model/messageBlock/types";
import { navigateToMessage } from "../model/store/useChatNavigationStore";

type MessageReplyProps = {
  className?: string;
  isMine?: boolean;
  message: ReplyBlock;
};

export const MessageReply: React.FC<MessageReplyProps> = ({ className, isMine, message }) => {
  const { chatUid } = useChatStore();
  const firstImage = message.filesList.find((file) =>
    IMAGE_TYPES.some((t) => t.startsWith(file.fileType || "")),
  )?.fileUrl;

  const firstFile = message.filesList.find((file) =>
    FILE_TYPES.some((t) => t.startsWith(file.fileType || "")),
  );

  const singleFileCaption = () => {
    if (message.filesList.length === 1 && firstFile) {
      return firstFile.fileUrl.split("/").pop();
    }
    return "";
  };

  const fileCaption = singleFileCaption();

  const caption = getLastMessagePreview({
    content: message.content,
    files: {
      count: message.filesList.length,
      types: message.filesList.length
        ? message.filesList
            .map((file) => file.fileType)
            .filter((type): type is string => Boolean(type))
        : [],
    },
  });

  return (
    <div className="px-3 pt-2.5">
      <div
        className={cn(
          "border-primary-secondary flex w-full cursor-pointer rounded-sm border-l-4 py-1 pr-2.5 pl-1.5 transition-colors duration-200",
          isMine
            ? "bg-white/50 hover:bg-white/70"
            : "bg-primary-secondary/10 hover:bg-primary-secondary/20",
          className,
        )}
        onClick={() => {
          navigateToMessage({
            type: "id_or_uid",
            userUid: chatUid || "",
            messageUid: message.messageUid,
          });
        }}
      >
        {firstFile && (
          <FileIcon
            size="mini"
            className="mr-1 min-w-9 shrink-0"
            type={"document"}
            previewUrl={firstFile.fileUrl}
          />
        )}
        {firstImage && (
          <Image
            src={firstImage}
            alt="image"
            width={48}
            height={48}
            className="mr-1 h-10 w-10 shrink-0 rounded-sm"
          />
        )}

        <div className="grid min-w-0 flex-1 grid-cols-1 gap-0.5">
          <span className="text-primary minitext truncate font-medium">{message.authorName}</span>

          {!fileCaption && (
            <span className="minitext emojis-apple text-gray truncate">
              {caption.text || message.content}
            </span>
          )}

          {fileCaption && (
            <span className="minitext text-gray truncate">{truncateFileName(fileCaption)}</span>
          )}
        </div>
      </div>
    </div>
  );
};
