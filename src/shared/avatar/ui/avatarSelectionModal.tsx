"use client";

import { useRef, useState } from "react";

import { checkAvatarParams } from "@/shared/avatar/lib/checkAvatarParams";
import { ModalDialog } from "@/shared/modalDialog/ui/modalDialog";
import { cn } from "@/shared/shadcn/lib/utils";
import {
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/shadcn/ui/alert-dialog";
import { Button } from "@/shared/shadcn/ui/button";

import { ImageCropperModal } from "./imageCropper/imageCropperModal";

type AvatarSelectionModalProps = {
  className?: string;
  isOpen: boolean;
  avatarUrl: string;
  onAvatarChange: (file: File) => void;
  onAvatarDelete: () => void;
  onClose: () => void;
};

export const AvatarSelectionModal: React.FC<AvatarSelectionModalProps> = ({
  className,
  isOpen,
  avatarUrl,
  onClose,
  onAvatarDelete,
  onAvatarChange,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleCropComplete = async (croppedUrl: string) => {
    const res = await fetch(croppedUrl);
    const blob = await res.blob();
    const file = new File([blob], "avatar.png", {
      type: "image/png",
    });

    setSelectedFile(null);
    onAvatarChange(file);
    onClose();
  };

  const handleDelete = () => {
    setSelectedFile(null);
    onAvatarDelete();
  };

  const handleSelectFile = async (file: File | null) => {
    if (!file) return;
    const { isValid, error } = await checkAvatarParams(file);
    if (!isValid) {
      setLocalError(error || "");
      return;
    }
    setSelectedFile(file);
    setLocalError(null);
  };

  const handleUpload = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  return (
    <>
      {selectedFile && (
        <ImageCropperModal
          isOpen={!!selectedFile}
          onClose={() => setSelectedFile(null)}
          imgSrc={URL.createObjectURL(selectedFile)}
          onCropComplete={handleCropComplete}
        />
      )}
      {!selectedFile && (
        <ModalDialog className={cn(className)} open={isOpen} onOpenChange={onClose}>
          <AlertDialogHeader>
            <AlertDialogTitle>
              <span className="font-medium">Смена аватара</span>
            </AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter className="">
            {!selectedFile && (
              <input
                className="border-muted hover:bg-accent w-full cursor-pointer border p-2"
                type="file"
                hidden
                ref={inputRef}
                accept="image/png, image/jpeg, image/webp"
                onChange={(e) => handleSelectFile(e.target.files?.[0] || null)}
              />
            )}

            <div className="flex w-full flex-col gap-2">
              {localError && <span className="text-error mb-2">{localError}</span>}
              <Button
                variant="default"
                size="inline"
                className="text-primary subtext flex-1 justify-start rounded-md border-0 bg-transparent p-2"
                onClick={handleUpload}
              >
                Загрузить новое фото
              </Button>
              <Button
                variant="default"
                size="inline"
                className="text-primary subtext flex-1 justify-start rounded-md border-0 bg-transparent p-2"
                onClick={onClose}
              >
                Отмена
              </Button>
              {avatarUrl && (
                <Button
                  variant="default"
                  size="inline"
                  className="text-error subtext justify-start rounded-md border-0 bg-transparent p-2"
                  onClick={handleDelete}
                >
                  Удалить фото
                </Button>
              )}
            </div>
          </AlertDialogFooter>
        </ModalDialog>
      )}
    </>
  );
};
