"use client";

import { ChatParticipant } from "@/entities/chat/model/types";
import { ContactCard } from "@/entities/contact/ui/contactCard";
import { cn } from "@/shared/shadcn/lib/utils";

import { useParticipantContextMenu } from "../lib/useParticipantContextMenu";

type ParticipantCardProps = {
  participant: ChatParticipant;
  chatKey: string;
  isLast: boolean;
  isOwner: boolean;
  className?: string;
};

export const ParticipantCard: React.FC<ParticipantCardProps> = ({
  participant,
  chatKey,
  isLast,
  isOwner,
  className,
}) => {
  const { onContextMenu } = useParticipantContextMenu({ participant, chatKey, isOwner });

  return (
    <div className={cn("", className)} onContextMenu={onContextMenu}>
      <ContactCard contact={participant} isLast={isLast} />
    </div>
  );
};
