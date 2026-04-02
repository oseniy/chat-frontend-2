import { InviteLinkPreview } from "@/features/inviteToChat/ui/inviteLinkPreview";
import { MediaGrid } from "@/shared/ui/mediaGrid/mediaGrid";

import { AudioMessage } from "../../../recordVoiceMessage/ui/audioMessage";
import { MessageBlock } from "../model/messageBlock/types";
import { SendingStatus } from "../model/types/serverTypes";
import { FileMessage } from "./fileMessage";
import { MessageReply } from "./messageReply";
import { MessageText } from "./messageText";
import { MessageTimeAndStatus } from "./messageTimeAndStatus";

export const MessageBlockRenderer = ({
  block,
  isMine,
  time,
  status,
  hasText,
  id,
  hasNameAbove, // 1. Принимаем проп
}: {
  block: MessageBlock;
  isMine: boolean;
  time: string;
  hasText: boolean;
  status: SendingStatus;
  id: number;
  hasNameAbove?: boolean; // 2. Добавляем в определение типа
}) => {
  switch (block.type) {
    case "reply":
      return <MessageReply isMine={isMine} message={block} />;

    case "media":
      return (
        <div className="w-full">
          <MediaGrid
            items={block.items.map((file) => ({ id: file.id, type: file.type, src: file.src }))}
            id={id}
            isAbleToOpen
          />
          {!hasText && <MessageTimeAndStatus isMine={isMine} time={time} status={status} isEmpty />}
        </div>
      );
    case "file": {
      return block.items.map((file) => (
        <FileMessage key={file.id} file={file} time={time} status={status} isMine={isMine} />
      ));
    }

    case "audio": {
      return <AudioMessage file={block} isMine={isMine} time={time} status={status} />;
    }

    case "inviteLink":
      return <InviteLinkPreview chatKey={block.chatKey} token={block.token} />;

    case "text":
      return (
        <MessageText
          block={block}
          isMine={isMine}
          time={time}
          status={status}
          hasNameAbove={hasNameAbove} // Прокидываем в MessageText
        />
      );

    default:
      return null;
  }
};
