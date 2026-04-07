"use client";

import { Contact } from "@/entities/contact/model/types";
import { ContactCard } from "@/entities/contact/ui/contactCard";
import { Checkbox } from "@/shared/ui/checkBox";

import { useSelectContactsStore } from "../model/SelectContactsStore";

type ContactCardFeatureProps = {
  contact: Contact;
};

export const ContactCardFeature: React.FC<ContactCardFeatureProps> = ({ contact }) => {
  const isSelecting = useSelectContactsStore((s) => s.isSelecting);
  const toggleContact = useSelectContactsStore((s) => s.toggleContact);
  const isChecked = useSelectContactsStore((s) =>
    s.selected.some((item) => item.uid === contact.uid),
  );

  return (
    <ContactCard
      contact={contact}
      onClick={isSelecting ? () => toggleContact(contact) : undefined}
      after={isSelecting && <Checkbox checked={isChecked} />}
    />
  );
};
