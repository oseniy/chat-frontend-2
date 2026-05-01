/* eslint-disable @typescript-eslint/naming-convention */
import { ExternalLink } from "lucide-react";
import React, { useEffect } from "react";

import { MappedChatLink, useChatStore } from "@/entities/chat/model/useChatStore";
import { formatDate } from "@/shared/lib/hooks/formatDate";
import { cn } from "@/shared/shadcn/lib/utils";

const LinkItem = ({ link, isLast }: { link: MappedChatLink; isLast: boolean }) => {
  const author = `${link.fromUser.firstName} ${link.fromUser.lastName}`.trim() || "Ссылка";

  let displayTitle = link.title;
  if (!displayTitle) {
    try {
      displayTitle = new URL(link.url).hostname;
    } catch {
      displayTitle = "Ссылка";
    }
  }

  return (
    <React.Fragment>
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-3 p-4 transition-colors hover:bg-black/5"
      >
        <div className="bg-secondary text-muted-foreground group-hover:text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors">
          <ExternalLink size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-foreground truncate text-[14px] leading-tight font-semibold">
            {displayTitle}
          </p>
          <p className="text-primary truncate text-[13px] leading-tight">{link.url}</p>
          <p className="text-muted-foreground mt-0.5 text-[12px]">
            {author} • {formatDate(link.createdAt)}
          </p>
        </div>
      </a>
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
  const { links, fetchLinks, isLoadingLinks, chatKey: storeKey } = useChatStore();
  const effectiveChatKey = chatKeyProp ?? storeKey;

  useEffect(() => {
    if (effectiveChatKey) {
      fetchLinks(effectiveChatKey);
    }
  }, [effectiveChatKey, fetchLinks]);

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
