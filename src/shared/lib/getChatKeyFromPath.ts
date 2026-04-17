export const getChatKeyFromPath = (path: string): string | null => {
  const chatKeyRegex = /(group|channel)_[a-f0-9-]{36}/i;
  const match = path.match(chatKeyRegex);
  return match ? match[0] : null;
};
