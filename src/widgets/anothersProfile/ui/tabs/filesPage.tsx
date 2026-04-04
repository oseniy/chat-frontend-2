import { FileText } from "lucide-react";
import React, { useEffect } from "react";

import { useChatStore } from "@/entities/chat/model/useChatStore";
import { formatBytes } from "@/shared/lib/formatBytes";
import { formatDate } from "@/shared/lib/formatDate";
import { cn } from "@/shared/shadcn/lib/utils";

type FilesPageProps = {
  className?: string;
};

export const FilesPage: React.FC<FilesPageProps> = ({ className }) => {
  const files = useChatStore((state) => state.files);
  const fetchFiles = useChatStore((state) => state.fetchFiles);
  const clearFiles = useChatStore((state) => state.clearFiles); // Добавили метод очистки
  const chatKey = useChatStore((state) => state.chatKey);
  const isLoading = useChatStore((state) => state.isLoadingFiles);

  useEffect(() => {
    if (chatKey) {
      fetchFiles(chatKey);
    }

    // Очистка при размонтировании компонента (уходе со страницы файлов)
    return () => {
      clearFiles();
    };
  }, [chatKey, fetchFiles, clearFiles]);

  if (isLoading && files.length === 0) {
    return <div className="text-muted-foreground p-10 text-center text-sm">Загрузка...</div>;
  }

  return (
    <div className={cn("flex flex-1 flex-col overflow-y-auto", className)}>
      {files.map((file, index) => (
        <React.Fragment key={file.uid}>
          <a
            href={file.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="group flex cursor-pointer items-center gap-3 p-4 transition-colors"
          >
            {/* иконка */}
            <div className="bg-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white">
              <FileText size={20} />
            </div>

            {/* Инфо о файле */}
            <div className="min-w-0 flex-1">
              <p className="text-foreground truncate text-[14px] leading-tight font-semibold">
                {file.name}
              </p>
              <p className="text-muted-foreground mt-0.5 text-[12px]">
                {formatBytes(file.size || 0)} • {formatDate(file.createdAt)}
              </p>
            </div>
          </a>

          {/* Разделительная линия */}
          {index < files.length - 1 && <div className="mx-4 border-b border-black/30" />}
        </React.Fragment>
      ))}
    </div>
  );
};
