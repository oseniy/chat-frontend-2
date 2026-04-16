"use client";

import { User } from "@/entities/user/model/types";
import { formatPhone } from "@/shared/lib/formatPhone";
import { formatDate } from "@/shared/lib/hooks/formatDate";
import { cn } from "@/shared/shadcn/lib/utils";
import { InfoItem } from "@/shared/ui/infoItems/infoItem";

type UserInfoListProps = {
  className?: string;
  initialData: User | null;
};

export const UserInfoList: React.FC<UserInfoListProps> = ({ className, initialData }) => {
  const nickname = initialData?.nickname;
  const phone = formatPhone(initialData?.username);
  const birthday = initialData?.birthday ? formatDate(initialData.birthday) : undefined;
  const bio = initialData?.bio;

  return (
    <div className={cn("flex w-full flex-col rounded-lg bg-white", className)}>
      {nickname && (
        <InfoItem title="Никнейм" text={nickname} className="text-primary" copy={true} />
      )}
      {phone && (
        <InfoItem
          title="Номер телефона"
          text={phone}
          textToCopy={initialData?.username}
          className="text-primary"
          copy={true}
        />
      )}
      {birthday && <InfoItem title="День рождения" text={birthday} className="text-black" />}
      {bio && bio.trim() !== "" && <InfoItem title="Описание" text={bio} className="text-black" />}
    </div>
  );
};
