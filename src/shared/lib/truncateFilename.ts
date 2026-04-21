export const truncateFileName = (name: string, maxLength = 24) => {
  if (name.length <= maxLength) return name;

  const match = name.match(/^(.*?)(\.[^.]+)$/);
  const base = match?.[1] ?? name;
  const ext = match?.[2] ?? "";

  const available = maxLength - ext.length - 3;
  const head = Math.ceil(available * 0.6);
  const tail = Math.floor(available * 0.4);

  return `${base.slice(0, head)}...${base.slice(-tail)}${ext}`;
};
