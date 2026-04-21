import { ChatParticipant } from "@/entities/chat/model/types";
import { Contact } from "@/entities/contact/model/types";

export const mapContactToParticipant = (contact: Contact): ChatParticipant => ({
  uid: contact.systemUid,
  firstName: contact.firstName,
  lastName: contact.lastName,
  fullName: contact.fullName ?? `${contact.firstName} ${contact.lastName}`.trim(),
  avatarUrl: contact.avatarUrl,
  avatarWebpUrl: contact.avatarWebpUrl,
  isDeleted: false,
  isOwner: false,
  isBlocked: false,
  isOnline: contact.isOnline,
  lastSeenAt: contact.lastSeenAt,
  isInContacts: true,
});
