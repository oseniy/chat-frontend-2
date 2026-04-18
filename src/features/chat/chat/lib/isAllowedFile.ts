import { BLOCKED_EXTENSIONS } from "./constants";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 МБ

export const isAllowedFile = (file: File): { isError: boolean; message?: string } => {
  const name = file.name.toLowerCase();

  if (BLOCKED_EXTENSIONS.some((ext) => name.endsWith(ext))) {
    return { isError: true, message: "Недопустимое расширение файла" };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { isError: true, message: "Максимальный размер файла - 10 МБ" };
  }

  if (
    file.type === "application/x-msdownload" || // exe
    file.type === "application/x-ms-installer"
  ) {
    return { isError: true, message: "Недопустимое расширение файла" };
  }

  if (
    file.type.startsWith("image/") ||
    file.type.startsWith("audio/") ||
    file.type.startsWith("video/")
  ) {
    return { isError: true, message: "Недопустимое расширение файла" };
  }

  return { isError: false };
};
