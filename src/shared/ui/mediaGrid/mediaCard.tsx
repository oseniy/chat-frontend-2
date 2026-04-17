import Image from "next/image";

import { cn } from "@/shared/shadcn/lib/utils";
import { Button } from "@/shared/shadcn/ui/button";
import Trash from "@/shared/ui/icons/sendFiles/trash.svg";

import { MediaItem } from "./mediaGrid";

type MediaCardProps = {
  className?: string;
  isAbleToOpen?: boolean;
  isDeleteMode: boolean;
  index: number;
  onDelete: (id: number) => void;
  onImageClick: (id: number) => void;
  item: MediaItem;
};

export const MediaCard: React.FC<MediaCardProps> = ({
  className,
  item,
  isDeleteMode,
  isAbleToOpen = false,
  index,
  onDelete,
  onImageClick,
}) => {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl bg-gray-100",
        !isDeleteMode && "group",
        className,
      )}
    >
      {/* Media */}
      <div
        className={cn(
          "relative h-full w-full",
          !isDeleteMode && "transition-transform duration-300 ease-out group-hover:scale-[1.04]",
        )}
      >
        {item.type === "video" && (
          <video src={item.src} autoPlay loop muted className="h-full w-full object-cover" />
        )}

        {item.type === "image" && (
          <Image
            src={item.src}
            alt="Image"
            fill
            loading="lazy"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 626px"
            className={cn("object-cover", isAbleToOpen && !isDeleteMode && "cursor-pointer")}
            onClick={() => !isDeleteMode && isAbleToOpen && onImageClick(index)}
          />
        )}
      </div>

      {!isDeleteMode && (
        <div
          className={cn(
            "pointer-events-none absolute inset-0",
            "bg-gradient-to-t from-black/30 via-black/10 to-transparent",
            "opacity-0 transition-opacity duration-300 group-hover:opacity-100",
          )}
        />
      )}

      {isDeleteMode && (
        <Button
          variant="text"
          size="inline"
          onClick={() => item.id && onDelete(item.id)}
          className="active:text-main-light-gray desktop:hover:text-main-light-gray absolute right-3 bottom-3 z-10 h-9 w-9 rounded-md bg-black/50 text-white hover:bg-black/50"
        >
          <Trash className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
};
