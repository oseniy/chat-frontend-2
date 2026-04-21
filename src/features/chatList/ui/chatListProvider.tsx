import { useChatList } from "../hooks/useChatListLogic";

type Props = {
  search: string;
  children: (data: ReturnType<typeof useChatList>) => React.ReactNode;
};

export const ChatListDataProvider = ({ search, children }: Props) => {
  const data = useChatList(search);

  return <>{children(data)}</>;
};
