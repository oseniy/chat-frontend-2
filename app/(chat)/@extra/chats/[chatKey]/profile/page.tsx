import { getChatServer } from "@/entities/chat/api/getChatServer";
import { getChatTypeLight } from "@/entities/chat/lib/getChatTypeLight";
import { getParticipantsServer } from "@/entities/chat/lib/getParticipantsServer";
import { MappedChatDetails } from "@/entities/chat/lib/mapChat";
import { getContactsServer } from "@/entities/contact/api/getContactsServer";
import { User } from "@/entities/user/model/types";
import { AnothersProfileClient } from "@/widgets/anothersProfile/ui/anothersProfileClient";
import { ChatProfileClient } from "@/widgets/anothersProfile/ui/chatProfileClient";

type ProfilePageProps = {
  params: Promise<{ chatKey: string }>;
};

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { chatKey } = await params;
  const chatType = getChatTypeLight(chatKey);
  const response = await getChatServer(chatKey, chatType);
  if (!response.success) {
    return <div>Ошибка загрузки профиля</div>;
  }

  if (chatType == "chat") {
    const contacts = await getContactsServer();
    return (
      <AnothersProfileClient
        contacts={contacts}
        chatType={chatType}
        chatInfo={response?.data as User | null}
      />
    );
  } else {
    const initialParticipants = await getParticipantsServer(chatKey);
    return (
      <ChatProfileClient
        initialParticipants={initialParticipants}
        chatKey={chatKey}
        chatType={chatType}
        chatInfo={response?.data as MappedChatDetails | null}
      />
    );
  }
}
