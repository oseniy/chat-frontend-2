"use client";

import AttachBtn from "@icons/chat/attachBtn.svg";
import MessageSendBtn from "@icons/chat/messageSendBtn.svg";
import VoiceMessage from "@icons/chat/voiceMessage.svg";
import { useState } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/shared/shadcn/lib/utils";
import { Button } from "@/shared/shadcn/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/shared/shadcn/ui/input-group";
import { useSendFilesContextMenu } from "@/widgets/contextMenu/lib/useSendFilesContextMenu";
import { EmojiPicker } from "@/widgets/emoji-picker/ui/emojiPicker";

import { useMessageForm } from "../lib/useMessageForm";
import { EmojiBtnToggle } from "./emojiBtnToggle";

type MessageFormProps = {
  className?: string;
  onEmojiBtnClick?: () => void;
  onAttachBtnClick?: () => void;
  onVoiceBtnClick?: () => void;
  onSubmitMessage: (message: string) => void;
  isKeyboardOpen: boolean;
  isAttachBtnDisabled?: boolean;
  isVoiceBtnDisabled?: boolean;
  isAbleToSendWithoutText?: boolean;
  placeholder?: string;
  variant?: "main" | "modal";
};

export const MessageForm: React.FC<MessageFormProps> = ({
  className,
  onAttachBtnClick,
  onSubmitMessage,
  onVoiceBtnClick,
  isKeyboardOpen,
  isAttachBtnDisabled = false,
  isVoiceBtnDisabled = false,
  isAbleToSendWithoutText = false,
  placeholder = "Сообщение",
  variant = "main",
}) => {
  const {
    textMessage,
    setTextMessage,
    textareaRef,
    handleSubmit,
    onKeyDown,
    emojiPickerOpen,
    onToggle,
    onEmojiSelect,
    pickerRef,
    emojiBtnRef,
  } = useMessageForm({
    onSubmitMessage,
    isKeyboardOpen,
  });

  const { onContextMenu, isOpen } = useSendFilesContextMenu();

  const [pickerStyle, setPickerStyle] = useState<React.CSSProperties>({});

  const updatePickerPosition = () => {
    const btnRect = emojiBtnRef.current?.getBoundingClientRect();
    if (!btnRect) return;
    const isDesktop = window.innerWidth >= 1023;
    setPickerStyle({
      position: "fixed",
      bottom: window.innerHeight - btnRect.top + 8,
      zIndex: 50,
      ...(isDesktop
        ? { right: window.innerWidth - btnRect.right }
        : { left: "50%", transform: "translateX(-50%)" }),
    });
  };

  return (
    <div className="relative w-full">
      <form
        className={cn("relative flex items-end px-4 py-3", className)}
        onSubmit={(e) => {
          if (isAbleToSendWithoutText || variant === "modal") {
            handleSubmit(e, true);
          } else {
            handleSubmit(e);
          }
        }}
      >
        {!isAttachBtnDisabled && (
          <div className="flex h-11 flex-row-reverse pr-3">
            <Button
              variant="ghost"
              size="icon-auto"
              onClick={(e) => {
                onAttachBtnClick?.();
                onContextMenu(e);
              }}
              type="button"
              className={cn(
                isOpen && "bg-primary-hover",
                "hover:bg-primary-hover rounded-full transition-colors duration-200",
              )}
            >
              <AttachBtn className="text-primary h-11 w-11" />
            </Button>
          </div>
        )}

        <InputGroup className="relative flex h-min w-full rounded-3xl bg-white">
          <div
            className={cn(
              "reletive desktop:max-h-[448px] flex max-h-[172px] flex-1 overflow-hidden rounded-3xl",
              variant === "main"
                ? "desktop:max-h-[448px] max-h-[172px]"
                : "desktop:max-h-[172px] max-h-[172px]",
            )}
          >
            <div className="desktop:[&::-webkit-scrollbar]:inline flex flex-1 overflow-y-auto pr-10 [&::-webkit-scrollbar]:hidden">
              <InputGroupTextarea
                ref={textareaRef}
                onKeyDown={onKeyDown}
                rows={1}
                placeholder={placeholder}
                value={textMessage}
                onChange={(e) => setTextMessage(e.target.value)}
                className={cn(
                  "subtext emojis-apple resize-none overflow-hidden pt-3.5",
                  variant === "main" ? "h-12 min-h-12" : "h-8 min-h-9 p-2 pl-3",
                )}
              />
            </div>
          </div>

          <InputGroupAddon
            ref={emojiBtnRef}
            align="inline-end"
            className={cn(
              "absolute right-0 bottom-3 pr-2 pb-0.5",
              variant === "modal" && "bottom-1.5",
            )}
          >
            <InputGroupButton
              onClick={(e) => {
                e.stopPropagation();
              }}
              type="button"
              size="icon-auto"
              variant="ghost"
              asChild
            >
              <EmojiBtnToggle
                className="h-5 w-5"
                pressed={emojiPickerOpen}
                onToggle={() => {
                  if (!emojiPickerOpen) updatePickerPosition();
                  onToggle();
                }}
              />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>

        <div className={cn(variant === "main" ? "h-11 pl-3" : "align-end flex pb-0.5 pl-3")}>
          {textMessage.trim() || isVoiceBtnDisabled || isAbleToSendWithoutText ? (
            <Button
              variant="ghost"
              size="icon-auto"
              type="submit"
              onMouseDown={(e) => e.preventDefault()}
            >
              <MessageSendBtn className={cn(variant === "main" ? "h-11 w-11" : "h-8 w-8")} />
            </Button>
          ) : (
            <Button variant="ghost" size="icon-auto" type="button" onClick={onVoiceBtnClick}>
              <VoiceMessage className="h-11 w-11" />
            </Button>
          )}
        </div>
      </form>
      {emojiPickerOpen &&
        createPortal(
          <div ref={pickerRef} style={pickerStyle}>
            <EmojiPicker
              onEmojiSelect={onEmojiSelect}
              size={variant === "modal" ? "mini" : "standart"}
            />
          </div>,
          document.body,
        )}
    </div>
  );
};
