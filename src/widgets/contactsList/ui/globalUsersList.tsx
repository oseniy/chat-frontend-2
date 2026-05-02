import { Contact } from "@/entities/contact/model/types";
import { ContactCardDeleteFeature } from "@/features/contacts/ui/ContactCardDeleteFeature";
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
        return <ContactCardDeleteFeature contact={c} key={c.systemUid} />;
      })}
    </div>
  );
};
