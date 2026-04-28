"use client";

import Close from "@icons/chat/close.svg";
import Download from "@icons/chat/download.svg";
import Forwarded from "@icons/chat/forwardedd.svg";
import SlideArrow from "@icons/chat/slideLeft.svg";
import Trash from "@icons/sendFiles/trash.svg";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { useChatStore } from "@/entities/chat/model/useChatStore";
import { downloadFile } from "@/shared/lib/downloadFile";
import { cn } from "@/shared/shadcn/lib/utils";
import { Button } from "@/shared/shadcn/ui/button";
import { Toast } from "@/shared/toast/ui/toast";

import { useMediaViewerStore } from "../model/useMediaViewerStore";

export const MediaViewerMobile = () => {
  const { isOpen, messageUid, mediaIndex, close, next, prev } = useMediaViewerStore();

  const message = useChatStore((s) => s.messages.find((m) => m.id === messageUid));
  const [isToastOpen, setIsToastOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isClamped, setIsClamped] = useState(true);
  const [isVisible, setIsVisible] = useState(false); // Для анимации появления

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const minSwipeDistance = 50;

  // Плавное закрытие
  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(close, 250); // Ждем завершения анимации
  }, [close]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Swipe logic
  const onTouchStart = (e: React.TouchEvent) => {
    touchEndX.current = null;
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && mediaIndex < (message?.filesList?.length ?? 0) - 1) {
      next();
    }
    if (isRightSwipe && mediaIndex > 0) {
      prev();
    }
  };

  const toggleExpansion = () => {
    if (!isExpanded) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setIsClamped(false);
      setIsExpanded(true);
    } else {
      setIsExpanded(false);
      timeoutRef.current = setTimeout(() => {
        setIsClamped(true);
      }, 300);
    }
  };

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
        "fixed inset-0 z-50 bg-black transition-opacity duration-250 ease-in-out",
        isVisible ? "opacity-100" : "opacity-0",
      )}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Header - Уезжает вверх */}
      <div
        className={cn(
          "absolute top-8 right-8 left-8 flex gap-2 text-white transition-transform duration-300",
          isVisible ? "translate-y-0" : "-translate-y-10",
        )}
      >
        <div className="flex w-full items-center justify-between">
          <Button
            variant="text"
            size="icon"
            className="flex h-5 w-3 items-center gap-2"
            onClick={handleClose}
          >
            <SlideArrow className="h-5 w-3 text-white" />
          </Button>
          <span className="font-medium text-white">
            {mediaIndex + 1}/{message.filesList?.length}
          </span>
          <div className="w-3" />
        </div>
      </div>

      {/* Media - Мягко увеличивается */}
      <div className="flex h-full items-center justify-center">
        <div
          className={cn(
            "relative h-full max-h-[70vh] w-full transition-all duration-300 ease-out",
            isVisible ? "scale-100 opacity-100" : "scale-90 opacity-0",
          )}
        >
          {(media.fileType?.startsWith("image") || media.fileType?.startsWith("application")) && (
            <Image
              src={media.fileUrl}
              alt="media"
              fill
              sizes="100vw"
              className="object-contain"
              priority
            />
          )}

          {media.fileType?.startsWith("video") && (
            <video src={media.fileUrl} controls autoPlay className="max-h-[80vh] w-full" />
          )}
        </div>
      </div>

      {/* Content - Выезжает снизу */}
      {message.content.trim() && (
        <div
          className={cn(
            "absolute bottom-[100px] left-1/2 z-10 w-full -translate-x-1/2 px-4 transition-all duration-300",
            isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0",
          )}
        >
          <div
            onClick={toggleExpansion}
            className={cn(
              "scrollbar-hide mx-auto w-full rounded-md bg-[#0000004D] px-4 py-2 text-center leading-snug text-white transition-all duration-300 ease-in-out",
              isExpanded ? "max-h-[50vh] overflow-y-auto" : "max-h-[3.5em] overflow-hidden",
            )}
          >
            <p className={isClamped ? "line-clamp-2" : ""}>{message.content}</p>
          </div>
        </div>
      )}

      {/* Footer Actions */}
      <div
        className={cn(
          "absolute bottom-0 left-0 z-20 flex w-full items-center justify-between p-4 transition-transform duration-300",
          isVisible ? "translate-y-0" : "translate-y-10",
        )}
      >
        <Button
          variant="text"
          size="icon"
          className="h-11 w-11 text-white"
          onClick={async () => {
            const isDownloaded = await downloadFile(media.fileUrl, media.fileUrl.split("/").pop());
            if (isDownloaded) {
              setIsToastOpen(true);
            }
          }}
        >
          <Download className="h-6 w-6" />
        </Button>
        <Button variant="text" size="icon" className="h-11 w-11 text-white">
          <Forwarded className="h-6 w-6" />
        </Button>
        <div className="flex flex-col items-center gap-1">
          <span className="minitext line-clamp-1 font-medium text-white">
            {message.fromUser.firstName} {message.fromUser.lastName}
          </span>
          <span className="caption text-white/70">{time}</span>
        </div>
        <Button variant="text" size="icon" className="hover:text-error h-11 w-11 text-white">
          <Trash className="h-6 w-6" />
        </Button>
        <Button onClick={handleClose} variant="text" size="icon" className="h-11 w-11 text-white">
          <Close className="h-6 w-6" />
        </Button>
      </div>

      {/* Toast Wrapper */}
      {isToastOpen && (
        <div className="animate-in fade-in zoom-in absolute top-1/2 left-1/2 z-50 w-full max-w-[90%] -translate-x-1/2 -translate-y-1/2 duration-200">
          <Toast
            message="Файл успешно скачан"
            onClose={() => setIsToastOpen(false)}
            icon={{ mobile: "/download.svg", desktop: "/download.svg" }}
          />
        </div>
      )}
    </div>
  );
};
