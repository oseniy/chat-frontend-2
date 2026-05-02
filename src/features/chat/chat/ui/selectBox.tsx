import Close from "@icons/chat/close.svg";
import Copy from "@icons/chat/context-menu/copy.svg";
import Forward from "@icons/chat/forwardedd.svg";
import Trash from "@icons/sendFiles/trash.svg";

import { useChatStore } from "@/entities/chat/model/useChatStore";
import { useModalStore } from "@/entities/modals/model/useGlobalModalStore";
import { pluralize } from "@/shared/lib/pluralize";
import { cn } from "@/shared/shadcn/lib/utils";
import { Button } from "@/shared/shadcn/ui/button";
import { useToast } from "@/shared/toast/ui/toastProvider";

import { useCopySelectedMessages } from "../hooks/useCopySelectedMessages";

type SelectBoxProps = {
  className?: string;
};

export const SelectBox: React.FC<SelectBoxProps> = ({ className }) => {
  const { messages, selectedMessageUids, setForwardTargets, exitSelectionMode, chatKey } =
    useChatStore();
  const { showToast } = useToast();
  const { openModal } = useModalStore();
  const copySelectedMessages = useCopySelectedMessages(Array.from(selectedMessageUids));

  const handleCopy = () => {
    copySelectedMessages().then(() => {
      exitSelectionMode();
      showToast("Сообщения скопированы", {
        mobile: "/icons/toast/checkMobile.svg",
        desktop: "/icons/toast/checkDesktop.svg",
      });
    });
  };

  const handleForward = () => {
    const selectedMessages = messages.filter((m) => selectedMessageUids.has(m.uid));

    setForwardTargets(selectedMessages);
    openModal("forward", { chatKey: chatKey! });
    exitSelectionMode();
  };

  if (!selectedMessageUids.size) return null;

  return (
    <div
      className={cn("flex min-h-[72px] w-full items-center justify-between px-4 py-3", className)}
    >
      <div className="flex items-center gap-4">
        <Button
          variant={"text"}
          size={"inline"}
          className="text-gray desktop:hover:text-gray active:text-primary-dark h-5 w-5 shrink-0"
          onClick={exitSelectionMode}
        >
          <Close className="h-5 w-5" />
        </Button>
        <span className="text font-medium text-black">
          Выбрано {selectedMessageUids.size}{" "}
          {pluralize(selectedMessageUids.size, "сообщение", "сообщения", "сообщений")}
        </span>
      </div>

      <div className="flex gap-3">
        <Button
          variant={"text"}
          size={"inline"}
          className="text-gray desktop:active:text-primary-dark desktop:hover:text-gray active:text-primary-dark h-9 w-9 shrink-0"
          onClick={handleForward}
        >
          <Forward className="h-6 w-6" />
        </Button>
        <Button
          variant="text"
          size="inline"
          className="text-gray desktop:active:text-primary-dark desktop:hover:text-gray active:text-primary-dark h-9 w-9 shrink-0"
          onClick={handleCopy}
        >
          <Copy className="h-6 w-6" />
        </Button>
        <Button
          variant={"text"}
          size={"inline"}
          className="text-error desktop:active:text-active-error desktop:hover:text-error active:text-active-error h-9 w-9 shrink-0"
          onClick={() => {
            openModal("deleteMessage", { messageId: "", chatKey: chatKey! });
          }}
        >
          <Trash className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};
