import Close from "@icons/chat/close.svg";
import Image from "next/image";

import { getLastMessagePreview } from "@/entities/chat/lib/getLastMessagePreview";
import { useChatStore } from "@/entities/chat/model/useChatStore";
import { useUserStore } from "@/entities/user/model/userStore";
import { FILE_TYPES, IMAGE_TYPES } from "@/features/chatList/model/constants";
import { pluralize } from "@/shared/lib/pluralize";
import { cn } from "@/shared/shadcn/lib/utils";
import { Button } from "@/shared/shadcn/ui/button";
import { FileIcon } from "@/shared/ui/fileList/fileIcon";

type ForwardBoxProps = {
  className?: string;
};

export const ForwardBox: React.FC<ForwardBoxProps> = ({ className }) => {
  const { forwardTargets, setForwardTargets } = useChatStore();
  const userId = useUserStore((s) => s.userId);
  if (!forwardTargets.length) return null;
  const isMine = forwardTargets[0].fromUser.uid === userId;
  const userTag = isMine
    ? "Вы"
    : forwardTargets[0].fromUser.lastName
      ? forwardTargets[0].fromUser.firstName + " " + forwardTargets[0].fromUser.lastName
      : forwardTargets[0].fromUser.firstName;

  const firstImage = forwardTargets[0].filesList?.find((file) =>
    IMAGE_TYPES.some((t) => t.startsWith(file.fileType || "")),
  )?.fileUrl;

  const firstFile = forwardTargets.find((file) =>
    FILE_TYPES.some((t) => t.startsWith(file.filesList[0]?.fileType || " ")),
  );

  const singleFileCaption = () => {
    if (firstFile?.filesList.length === 1) {
      return firstFile.filesList[0].fileUrl.split("/").pop();
    }
    return "";
  };

  const fileCaption = singleFileCaption();

  const caption = getLastMessagePreview({
    content: forwardTargets[0].content,
    files: {
      count: forwardTargets[0].filesList.length || 0,
      types:
        forwardTargets[0].filesList
          .map((file) => file.fileType)
          .filter((t): t is string => Boolean(t)) || [],
    },
  });

  return (
    <div
      className={cn(
        "bg-primary-secondary/10 border-primary-secondary w-full border-t px-4 py-1",
        className,
      )}
    >
      <div className="border-primary-secondary flex items-center justify-between border-l-4">
        {firstFile && (
          <FileIcon
            size="mini"
            className="ml-1"
            type={"document"}
            previewUrl={firstFile.filesList[0].fileUrl}
          />
        )}
        {firstImage && (
          <Image
            src={firstImage}
            alt="image"
            width={48}
            height={48}
            className="ml-1 h-10 w-10 rounded-md bg-white object-cover"
          />
        )}
        <div className="minitext flex min-w-0 flex-1 flex-col justify-between gap-0.5 pl-1">
          <span className="text-primary">
            Переслать {forwardTargets.length > 1 ? forwardTargets.length : ""}{" "}
            {pluralize(forwardTargets.length, "сообщение", "сообщения", "сообщений")}
          </span>
          <div className="emojis-apple text-gray truncate">
            <span className="font-medium">{userTag}</span>
            {": "}
            {fileCaption || caption.text || forwardTargets[0].content}
          </div>
        </div>
        <Button
          onClick={() => setForwardTargets([])}
          variant={"text"}
          size={"inline"}
          className="h-3.5 w-3.5 shrink-0"
        >
          <Close />
        </Button>
      </div>
    </div>
  );
};
