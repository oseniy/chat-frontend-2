"use client";

import Close from "@icons/chat/close.svg";
import Download from "@icons/chat/download.svg";
import Forwarded from "@icons/chat/forwardedd.svg";
import SlideArrow from "@icons/chat/slideLeft.svg";
import Trash from "@icons/sendFiles/trash.svg";
import Image from "next/image";
import { useEffect, useState } from "react";

import { useChatStore } from "@/entities/chat/model/useChatStore";
import { Avatar } from "@/entities/chat/ui/avatar";
import { downloadFile } from "@/shared/lib/downloadFile";
import { Button } from "@/shared/shadcn/ui/button";
import { Toast } from "@/shared/toast/ui/toast";

import { useMediaViewerStore } from "../model/useMediaViewerStore";

export const MediaViewer = () => {
  const { isOpen, messageUid, mediaIndex, close, next, prev } = useMediaViewerStore();

  const message = useChatStore((s) => s.messages.find((m) => m.id === messageUid));
  const [isToastOpen, setIsToastOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight" && mediaIndex < (message?.filesList?.length ?? 0) - 1) next();
      if (e.key === "ArrowLeft" && mediaIndex > 0) prev();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close, next, prev, mediaIndex, message?.filesList?.length]);

  if (!isOpen || !message) return null;

  const media = message.filesList[mediaIndex];

  const time = new Date(message.createdAt * 1000).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  if (!media) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#1C1C1EF5]">
      {/* header */}
      <div className="absolute top-8 right-0 left-8 flex gap-2 text-white">
        <Avatar avatarUrl={message.fromUser.avatarUrl} />
        <div className="flex flex-col gap-1">
          <span className="text text-gray font-medium">
            {message.fromUser.firstName + " " + message.fromUser.lastName}
          </span>
          <span className="text-gray subtext">{time}</span>
        </div>
      </div>

      {/* media */}
      <div className="flex h-full items-center justify-center">
        <div className="relative h-full max-h-[70vh] w-full max-w-[626px]">
          {(media.fileType?.startsWith("image") || media.fileType?.startsWith("application")) && (
            <Image
              src={media.fileUrl}
              alt={media.fileUrl.split("/").pop() || ""}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 626px"
              className="object-contain"
            />
          )}

          {media.fileType?.startsWith("video") && (
            <video src={media.fileUrl} controls autoPlay className="h-full w-full object-cover" />
          )}
        </div>
      </div>

      {message.content.trim() && (
        <p className="absolute bottom-6 left-1/2 max-w-[744px] -translate-x-1/2 rounded-md bg-[#0000004D] px-4 py-1 text-center break-words whitespace-pre-wrap text-white">
          {message.content}
        </p>
      )}

      {isToastOpen && (
        <Toast
          message="Файл успешно скачан"
          onClose={() => setIsToastOpen(false)}
          icon={{
            mobile: "/download.svg",
            desktop: "/download.svg",
          }}
        />
      )}

      <div className="absolute top-8 right-8 flex items-center gap-7">
        <Button
          variant={"text"}
          size={"icon"}
          className="text-gray h-8 w-8 hover:text-white"
          onClick={() => {
            downloadFile(media.fileUrl, media.fileUrl.split("/").pop());
            setIsToastOpen(true);
          }}
        >
          <Download className="h-8 w-8" />
        </Button>
        <Button variant={"text"} size={"icon"} className="text-gray h-8 w-8 hover:text-white">
          <Forwarded className="h-8 w-8" />
        </Button>
        <Button variant={"text"} size={"icon"} className="text-gray hover:text-error h-8 w-8">
          <Trash className="h-8 w-8" />
        </Button>
        <Button
          onClick={close}
          variant={"text"}
          size={"icon"}
          className="text-gray h-8 w-8 hover:text-white"
        >
          <Close className="h-8 w-8" />
        </Button>
      </div>

      <div className="absolute right-7 bottom-7">
        <span className="text text-gray">
          {mediaIndex + 1}/{message.filesList?.length}
        </span>
      </div>

      {mediaIndex > 0 && (
        <Button
          variant={"text"}
          size={"icon"}
          onClick={prev}
          className="text-gray absolute top-1/2 left-33 h-12 w-6"
        >
          <SlideArrow className="h-full w-full" />
        </Button>
      )}

      {mediaIndex < (message.filesList?.length ?? 0) - 1 && (
        <Button
          variant={"text"}
          size={"icon"}
          onClick={next}
          className="text-gray absolute top-1/2 right-33 h-12 w-6"
        >
          <SlideArrow className="h-full w-full rotate-180" />
        </Button>
      )}
    </div>
  );
};
