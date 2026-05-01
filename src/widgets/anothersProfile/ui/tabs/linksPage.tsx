/* eslint-disable @typescript-eslint/naming-convention */
import { ExternalLink } from "lucide-react";
import React, { useEffect } from "react";

import { MappedChatLink, useChatStore } from "@/entities/chat/model/useChatStore";
import { formatDate } from "@/shared/lib/hooks/formatDate";
import { cn } from "@/shared/shadcn/lib/utils";

const LinkItem = ({ link, isLast }: { link: MappedChatLink; isLast: boolean }) => {
  const author = `${link.fromUser.firstName} ${link.fromUser.lastName}`.trim() || "Ссылка";

  // Определяем заголовок и первую букву для иконки
  let displayTitle = link.title;
  if (!displayTitle) {
    try {
      displayTitle = new URL(link.url).hostname;
    } catch {
      displayTitle = "Ссылка";
    }
  }
  const firstLetter = displayTitle.charAt(0).toUpperCase();

  return (
    <React.Fragment>
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-3 p-4 transition-colors hover:bg-black/5"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-[#6b5cd9] text-[18px] font-bold text-white">
          {firstLetter}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <p className="text-foreground truncate text-[14px] leading-tight font-bold">
              {displayTitle}
            </p>
            <ExternalLink
              size={12}
              className="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
            />
          </div>

          <p className="mt-0.5 truncate text-[13px] leading-tight text-[#3b82f6]">{link.url}</p>

          <p className="text-muted-foreground mt-1 text-xs">
            {author} • {formatDate(link.createdAt)}
          </p>
        </div>
      </a>
      {/* Тонкий разделитель, как в голосовых */}
      {!isLast && <div className="mx-4 border-b border-black/10" />}
    </React.Fragment>
  );
};
/* eslint-enable @typescript-eslint/naming-convention */

type LinksPageProps = {
  className?: string;
  chatKey?: string;
};

export const LinksPage: React.FC<LinksPageProps> = ({ className, chatKey: chatKeyProp }) => {
  const { links, fetchLinks, clearLinks, isLoadingLinks, chatKey: storeKey } = useChatStore();
  const effectiveChatKey = chatKeyProp ?? storeKey;

  useEffect(() => {
    if (effectiveChatKey) {
      fetchLinks(effectiveChatKey);
    }
    // Очищаем ссылки при уходе со страницы, чтобы при открытии другого профиля не было старых данных
    return () => clearLinks();
  }, [effectiveChatKey, fetchLinks, clearLinks]);

  if (isLoadingLinks && links.length === 0) {
    return <div className="text-muted-foreground p-10 text-center text-sm">Загрузка...</div>;
  }

  return (
    <div className={cn("flex flex-1 flex-col overflow-y-auto", className)}>
      {links.length === 0 ? (
        <div className="text-muted-foreground p-10 text-center text-sm">Ссылок нет</div>
      ) : (
        links.map((link, index) => (
          <LinkItem
            key={`${link.messageId}-${link.url}`}
            link={link}
            isLast={index === links.length - 1}
          />
        ))
      )}
    </div>
  );
};
