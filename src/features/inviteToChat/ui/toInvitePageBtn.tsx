"use client";
import PlusInCircle from "@icons/plusInCircle.svg";

import { Button } from "@/shared/shadcn/ui/button";
import { useAnothersProfileUIStore } from "@/widgets/anothersProfile/model/anothersProfileUIStore";

type ToInvitePageBtnProps = {
  chatType: "group" | "channel" | "chat";
};

export const ToInvitePageBtn: React.FC<ToInvitePageBtnProps> = ({ chatType }) => {
  const buttonText = chatType === "group" ? "Добавить участников" : "Добавить подписчиков";
  const setActiveSection = useAnothersProfileUIStore((s) => s.setActiveSection);

  return (
    <Button
      variant="ghost"
      size="icon-auto"
      className="text-primary hover:text-primary-secondary smooth"
      onClick={() => setActiveSection("invite")}
    >
      <PlusInCircle className="h-5 w-5" />
      <p className="subtext">{buttonText}</p>
    </Button>
  );
};
