import { BLOCKED_EXTENSIONS } from "./constants";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 МБ

export const isAllowedFile = (file: File) => {
  const name = file.name.toLowerCase();

  if (BLOCKED_EXTENSIONS.some((ext) => name.endsWith(ext))) {
    return false;
  }

  if (
    file.type === "application/x-msdownload" || // exe
    file.type === "application/x-ms-installer"
  ) {
    return false;
  }

  if (
    file.type.startsWith("image/") ||
    file.type.startsWith("audio/") ||
    file.type.startsWith("video/")
  ) {
    return false;
  }

  if (file.size > MAX_FILE_SIZE) {
    return false;
  }

  return true;
};
