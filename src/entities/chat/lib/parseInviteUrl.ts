type InviteUrlData = {
  chatKey: string;
  token: string;
};

export const INVITE_URL_REGEX =
  /(?:https?:\/\/[^/\s]+)?\/chats\/((?:group|channel)_[a-f0-9-]+)\?token=([^\s&]+)/;

export const parseInviteUrl = (text: string): InviteUrlData | null => {
  const match = text.match(INVITE_URL_REGEX);
  if (!match) return null;

  return {
    chatKey: match[1],
    token: match[2],
  };
};
