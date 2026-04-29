import { FileText } from "lucide-react";
import React, { useEffect, useMemo } from "react";

import { useChatStore } from "@/entities/chat/model/useChatStore";
import { formatBytes } from "@/shared/lib/hooks/formatBytes";
import { formatDate } from "@/shared/lib/hooks/formatDate";
import { cn } from "@/shared/shadcn/lib/utils";

type FilesPageProps = {
  className?: string;
};

export const FilesPage: React.FC<FilesPageProps> = ({ className }) => {
  const files = useChatStore((state) => state.files);
  const fetchFiles = useChatStore((state) => state.fetchFiles);
  const clearFiles = useChatStore((state) => state.clearFiles);
  const chatKey = useChatStore((state) => state.chatKey);
  const isLoading = useChatStore((state) => state.isLoadingFiles);

  useEffect(() => {
    if (chatKey) {
      fetchFiles(chatKey);
    }
    return () => {
      clearFiles();
    };
  }, [chatKey, fetchFiles, clearFiles]);

  const filteredFiles = useMemo(() => {
    return files.filter((file) => {
      const type = file.fileType?.toLowerCase() || "";
      return !type.startsWith("image/") && !type.startsWith("audio/") && type !== "video/webm";
    });
  }, [files]);

  const handleDownload = async (e: React.MouseEvent, url: string, fileName: string) => {
    e.preventDefault();

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Сетевая ошибка при скачивании");

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Ошибка при скачивании файла:", error);
    }
  };

  if (isLoading && filteredFiles.length === 0) {
    return <div className="text-muted-foreground p-10 text-center text-sm">Загрузка...</div>;
  }

  // Добавлена проверка на отсутствие файлов
  if (!isLoading && filteredFiles.length === 0) {
    return (
      <div className="text-muted-foreground flex flex-1 items-center justify-center text-sm">
        Файлов пока нет
      </div>
    );
  }

  return (
    <div className={cn("flex flex-1 flex-col overflow-y-auto", className)}>
      {filteredFiles.map((file, index) => (
        <React.Fragment key={file.uid}>
          <div
            onClick={(e) => handleDownload(e, file.fileUrl || "", file.name || "file")}
            className="group flex cursor-pointer items-center gap-3 p-4 transition-colors hover:bg-black/5"
          >
            <div className="bg-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white">
              <FileText size={20} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-foreground truncate text-[14px] leading-tight font-semibold">
                {file.name}
              </p>
              <p className="text-muted-foreground mt-0.5 text-[12px]">
                {formatBytes(file.size || 0)} • {formatDate(file.createdAt)}
              </p>
            </div>
          </div>

          {index < filteredFiles.length - 1 && <div className="mx-4 border-b border-black/30" />}
        </React.Fragment>
      ))}
    </div>
  );
};
