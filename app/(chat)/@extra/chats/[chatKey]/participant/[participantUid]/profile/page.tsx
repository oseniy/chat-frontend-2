import { getChatServer } from "@/entities/chat/api/getChatServer";
import { getContactsServer } from "@/entities/contact/api/getContactsServer";
import { User } from "@/entities/user/model/types";
import { AnothersProfileClient } from "@/widgets/anothersProfile/ui/anothersProfileClient";

type ParticipantProfilePageProps = {
  params: Promise<{ chatKey: string; participantUid: string }>;
};

export default async function ParticipantProfilePage({ params }: ParticipantProfilePageProps) {
  const { participantUid } = await params;

  const response = await getChatServer(participantUid, "chat");
  if (!response.success) {
    return <div>Ошибка загрузки профиля участника</div>;
  }

  const contacts = await getContactsServer();

  return (
    <AnothersProfileClient
      contacts={contacts}
      chatType="chat"
      chatInfo={response.data as User | null}
    />
  );
}
