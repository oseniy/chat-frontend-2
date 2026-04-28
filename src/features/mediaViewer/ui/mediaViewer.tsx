"use client";

import Close from "@icons/chat/close.svg";
import Download from "@icons/chat/download.svg";
import Forwarded from "@icons/chat/forwardedd.svg";
import SlideArrow from "@icons/chat/slideLeft.svg";
import Trash from "@icons/sendFiles/trash.svg";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

import { useChatStore } from "@/entities/chat/model/useChatStore";
import { Avatar } from "@/entities/chat/ui/avatar";
import { downloadFile } from "@/shared/lib/downloadFile";
import { cn } from "@/shared/shadcn/lib/utils"; // Важно для динамических классов
import { Button } from "@/shared/shadcn/ui/button";
import { Toast } from "@/shared/toast/ui/toast";

import { useMediaViewerStore } from "../model/useMediaViewerStore";

export const MediaViewer = () => {
  const { isOpen, messageUid, mediaIndex, close, next, prev } = useMediaViewerStore();
  const message = useChatStore((s) => s.messages.find((m) => m.id === messageUid));

  const [isToastOpen, setIsToastOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false); // Для анимации появления

  // Функция плавного закрытия
  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(close, 200); // Задержка должна совпадать с duration в CSS (200ms)
  }, [close]);

  // Следим за открытием: как только isOpen true, запускаем анимацию
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
      if (e.key === "ArrowRight" && mediaIndex < (message?.filesList?.length ?? 0) - 1) next();
      if (e.key === "ArrowLeft" && mediaIndex > 0) prev();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleClose, next, prev, mediaIndex, message?.filesList?.length]);

  if (!isOpen || !message) return null;

  const media = message.filesList[mediaIndex];
  if (!media) return null;

  const time = new Date(message.createdAt * 1000).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 bg-[#1C1C1EF5] transition-opacity duration-200 ease-in-out",
        isVisible ? "opacity-100" : "opacity-0",
      )}
    >
      {/* header */}
      <div
        className={cn(
          "absolute top-8 right-0 left-8 flex gap-2 text-white transition-transform duration-300",
          isVisible ? "translate-y-0" : "-translate-y-4",
        )}
      >
        <Avatar avatarUrl={message.fromUser.avatarUrl} />
        <div className="flex flex-col gap-1">
          <span className="text text-gray font-medium">
            {message.fromUser.firstName + " " + message.fromUser.lastName}
          </span>
          <span className="text-gray subtext">{time}</span>
        </div>
      </div>

      {/* media content */}
      <div className="flex h-full items-center justify-center">
        <div
          className={cn(
            "relative h-full max-h-[70vh] w-full max-w-[626px] transition-all duration-300 ease-out",
            isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0",
          )}
        >
          {(media.fileType?.startsWith("image") || media.fileType?.startsWith("application")) && (
            <Image
              src={media.fileUrl}
              alt={media.fileUrl.split("/").pop() || ""}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 626px"
              className="object-contain"
              priority
            />
          )}

          {media.fileType?.startsWith("video") && (
            <video src={media.fileUrl} controls autoPlay className="h-full w-full object-contain" />
          )}
        </div>
      </div>

      {message.content.trim() && (
        <p
          className={cn(
            "absolute bottom-6 left-1/2 max-w-[744px] -translate-x-1/2 rounded-md bg-[#0000004D] px-4 py-1 text-center break-words whitespace-pre-wrap text-white transition-all duration-300",
            isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
          )}
        >
          {message.content}
        </p>
      )}

      {isToastOpen && (
        <Toast
          message="Файл успешно скачан"
          onClose={() => setIsToastOpen(false)}
          icon={{
            mobile: "/download.svg",
            desktop: "/download.svg",
          }}
        />
      )}

      {/* action buttons */}
      <div className="absolute top-8 right-8 flex items-center gap-7">
        <Button
          variant="text"
          size="icon"
          className="text-gray h-8 w-8 hover:text-white"
          onClick={async () => {
            const isDownloaded = await downloadFile(media.fileUrl, media.fileUrl.split("/").pop());
            if (isDownloaded) {
              setIsToastOpen(true);
            }
          }}
        >
          <Download className="h-8 w-8" />
        </Button>
        <Button variant="text" size="icon" className="text-gray h-8 w-8 hover:text-white">
          <Forwarded className="h-8 w-8" />
        </Button>
        <Button variant="text" size="icon" className="text-gray hover:text-error h-8 w-8">
          <Trash className="h-8 w-8" />
        </Button>
        <Button
          onClick={handleClose}
          variant="text"
          size="icon"
          className="text-gray h-8 w-8 hover:text-white"
        >
          <Close className="h-8 w-8" />
        </Button>
      </div>

      {/* counter */}
      <div className="absolute right-7 bottom-7">
        <span className="text text-gray">
          {mediaIndex + 1}/{message.filesList?.length}
        </span>
      </div>

      {/* arrows */}
      {mediaIndex > 0 && (
        <Button
          variant="text"
          size="icon"
          onClick={prev}
          className="text-gray absolute top-1/2 left-8 h-12 w-6 transition-opacity hover:text-white"
        >
          <SlideArrow className="h-full w-full" />
        </Button>
      )}

      {mediaIndex < (message.filesList?.length ?? 0) - 1 && (
        <Button
          variant="text"
          size="icon"
          onClick={next}
          className="text-gray absolute top-1/2 right-8 h-12 w-6 transition-opacity hover:text-white"
        >
          <SlideArrow className="h-full w-full rotate-180" />
        </Button>
      )}
    </div>
  );
};
