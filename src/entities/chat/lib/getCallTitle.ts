export const getCallTitle = (status: string, isMine: boolean): string => {
  if (status === "completed") return isMine ? "Исходящий звонок" : "Входящий звонок";
  if (!isMine && (status === "unreceived" || status === "failed")) return "Пропущенный звонок";
  return "Отменённый звонок";
};
