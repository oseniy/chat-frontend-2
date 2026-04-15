import { Contact } from "@/entities/contact/model/types";
import { ContactCardFeature } from "@/features/contacts/ui/ContactCardFeature";
import { cn } from "@/shared/shadcn/lib/utils";
import { ListSeparator } from "@/shared/ui/listSeparator";

type GlobalUsersListProps = {
  className?: string;
  globalUsers: Contact[];
};

export const GlobalUsersList: React.FC<GlobalUsersListProps> = ({ className, globalUsers }) => {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <ListSeparator text="Пользователи А-чата" />
      {globalUsers.map((c) => {
        return <ContactCardFeature contact={c} key={c.systemUid} />;
      })}
    </div>
  );
};
