import Image from "next/image";

import { cn } from "@/shared/shadcn/lib/utils";
import Audio from "@/shared/ui/icons/files/audioPreview.svg";
import File from "@/shared/ui/icons/files/filePreview.svg";
type FileIconProps = {
  className?: string;
  type: "document" | "image" | "video" | "audio";
  title?: string;
  previewUrl?: string;
  size?: "standart" | "mini";
};

const sizes = {
  standart: "w-12 h-12",
  mini: "w-9 h-9",
};

export const FileIcon: React.FC<FileIconProps> = ({
  className,
  type,
  previewUrl,
  title,
  size = "standart",
}) => {
  return (
    <div className={cn("flex items-center justify-center rounded-full", sizes[size], className)}>
      {type === "document" && <File className="h-full w-full" />}
      {(type === "image" || type === "video") && (
        <Image
          src={previewUrl || "imageLoader.svg"}
          //   alt={file.title || file.file.name}
          alt={title || "изображение"}
          width={48}
          height={48}
          className="h-full w-full rounded-md bg-white object-cover"
        />
      )}
      {type === "audio" && <Audio className="h-full w-full" />}
    </div>
  );
};
