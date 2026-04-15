import { Contact } from "@/entities/contact/model/types";
import { DeleteContactsToggler } from "@/features/contacts/deleteContacts/ui/deleteContactsToggler";
import { ContactCardDeleteFeature } from "@/features/contacts/ui/ContactCardDeleteFeature";
import { cn } from "@/shared/shadcn/lib/utils";
import { ListSeparator } from "@/shared/ui/listSeparator";

type ContactsListProps = {
  className?: string;
  contacts: Contact[];
};

export const ContactsList: React.FC<ContactsListProps> = ({ className, contacts }) => {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <ListSeparator text="Мои контакты" after={<DeleteContactsToggler />} />
      {contacts.map((c) => {
        return <ContactCardDeleteFeature contact={c} key={c.systemUid} />;
      })}
    </div>
  );
};
