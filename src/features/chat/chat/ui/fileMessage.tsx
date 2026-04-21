import { truncateFileName } from "@/shared/lib/truncateFilename";
import { cn } from "@/shared/shadcn/lib/utils";
import Audio from "@/shared/ui/icons/files/audioPreview.svg";
import File from "@/shared/ui/icons/files/filePreview.svg";
import { FileItem } from "@/shared/ui/mediaGrid/mediaGrid";

import { useFileSize } from "../hooks/useFileSize";
import { SendingStatus } from "../model/types/serverTypes";
import { MessageTimeAndStatus } from "./messageTimeAndStatus";
import { SpinnerWithX } from "./spinnerFile";

type FileMessageProps = {
  className?: string;
  file: FileItem;
  isMine: boolean;
  time: string;
  status: SendingStatus;
  isEmpty?: boolean;
};

export const FileMessage: React.FC<FileMessageProps> = ({
  className,
  file,
  isMine,
  time,
  status,
}) => {
  const { fileSize, isLoading } = useFileSize(file.src);

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} Б`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
  };

  return (
    <a
      download={file.src}
      href={file.src}
      className={cn("group flex items-center gap-3 px-3 py-2.5", className)}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full">
        {status === "pending" && <SpinnerWithX />}

        {file.type === "document" && status !== "pending" && (
          <File className="h-full w-full transition-transform duration-300 group-hover:scale-105" />
        )}

        {file.type === "audio" && status !== "pending" && (
          <Audio className="h-full w-full transition-transform duration-300 group-hover:scale-105" />
        )}
      </div>
      <div className="grid min-w-0 flex-1 grid-cols-1 gap-1">
        <span className="subtext group-hover:text-primary truncate text-black transition-colors duration-300">
          {truncateFileName(file.title || file.src.split("/").pop() || "")}
        </span>

        <div className="flex items-center justify-between gap-3">
          <span className="text-gray minitext truncate leading-4">
            {isLoading ? "..." : formatFileSize(fileSize)}
          </span>
          <MessageTimeAndStatus isMine={isMine} time={time} status={status} isEmpty={false} />
        </div>
      </div>
    </a>
  );
};
