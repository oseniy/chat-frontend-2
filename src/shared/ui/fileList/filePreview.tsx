import { formatFileSize } from "@/features/chat/chat/lib/formatFileSize";
import { PendingFile } from "@/features/chat/chat/model/store/useChatSendFilesStore";
import { truncateFileName } from "@/shared/lib/truncateFilename";
import { cn } from "@/shared/shadcn/lib/utils";

import { FileIcon } from "./fileIcon";

type FilePreviewProps = {
  className?: string;
  file: PendingFile;
};

export const FilePreview: React.FC<FilePreviewProps> = ({ className, file }) => {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      {/* <div className="flex h-12 w-12 items-center justify-center rounded-full">
        {file.type === "document" && <File className="h-full w-full" />}
        {(file.type === "image" || file.type === "video") && (
          <Image
            src={file.previewUrl || "imageLoader.svg"}
            alt={file.title || file.file.name}
            width={48}
            height={48}
            className="h-full w-full rounded-md bg-white object-cover"
          />
        )}
        {file.type === "audio" && <Audio className="h-full w-full" />}
      </div> */}
      <FileIcon
        type={file.type}
        title={file.title || file.file.name || ""}
        previewUrl={file.previewUrl}
      />
      <div className="grid min-w-0 flex-1 grid-cols-1 gap-1">
        <span className="subtext truncate text-black">
          {truncateFileName(file.title || file.file.name)}
        </span>
        <span className="text-gray minitext truncate">{formatFileSize(file.file?.size)}</span>
      </div>
    </div>
  );
};
