"use client";

import { Contact } from "@/entities/contact/model/types";
import { ContactCard } from "@/entities/contact/ui/contactCard";
import { Checkbox } from "@/shared/ui/checkbox";

type ContactCardFeatureProps = {
  contact: Contact;
  isSelecting?: boolean;
  isChecked?: boolean;
  onToggle?: (contact: Contact) => void;
};

export const ContactCardFeature: React.FC<ContactCardFeatureProps> = ({
  contact,
  isSelecting = false,
  isChecked = false,
  onToggle,
}) => {
  return (
    <ContactCard
      contact={contact}
      onClick={isSelecting && onToggle ? () => onToggle(contact) : undefined}
      after={isSelecting && <Checkbox checked={isChecked} />}
    />
  );
};
