import { MappedChatDetails } from "@/entities/chat/lib/mapChat";
import { EditChatForm } from "@/features/editChat";
import { cn } from "@/shared/shadcn/lib/utils";

type ChatSettingsPageProps = {
  className?: string;
  chatKey: string;
  chatInfo: MappedChatDetails;
};

export const ChatSettingsPage: React.FC<ChatSettingsPageProps> = ({
  className,
  chatKey,
  chatInfo,
}) => {
  return (
    <div className={cn("", className)}>
      <EditChatForm chatKey={chatKey} chatInfo={chatInfo} />
    </div>
  );
};
