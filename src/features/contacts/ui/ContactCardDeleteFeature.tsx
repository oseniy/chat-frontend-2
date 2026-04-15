"use client";

import { Contact } from "@/entities/contact/model/types";

import { useSelectContactsStore } from "../model/SelectContactsStore";
import { ContactCardFeature } from "./ContactCardFeature";

type ContactCardDeleteFeatureProps = {
  contact: Contact;
};

export const ContactCardDeleteFeature: React.FC<ContactCardDeleteFeatureProps> = ({ contact }) => {
  const isSelecting = useSelectContactsStore((s) => s.isSelecting);
  const toggleContact = useSelectContactsStore((s) => s.toggleContact);
  const isChecked = useSelectContactsStore((s) =>
    s.selected.some((item) => item.uid === contact.uid),
  );

  return (
    <ContactCardFeature
      contact={contact}
      isSelecting={isSelecting}
      isChecked={isChecked}
      onToggle={toggleContact}
    />
  );
};
