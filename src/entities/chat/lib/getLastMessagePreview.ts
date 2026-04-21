import { pluralize } from "@/shared/lib/pluralize";

import {
  AUDIO_TYPES,
  FILE_TYPES,
  GIF_TYPES,
  IMAGE_TYPES,
  MAX_ICONS_DISPLAY,
  VIDEO_TYPES,
} from "../../../features/chatList/model/constants";
import { GetLastMessagePreviewParams, LastMessagePreview, PreviewIconType } from "../model/types";

export const getLastMessagePreview = ({
  content,
  files,
}: GetLastMessagePreviewParams): LastMessagePreview => {
  if (!files || files.count === 0) {
    return { icons: [], text: content || "Сообщений нет" };
  }

  const { types, count } = files;

  const hasAudio = types.some((t) => AUDIO_TYPES.includes(t));
  const hasImages = types.some((t) => IMAGE_TYPES.includes(t) || GIF_TYPES.includes(t));
  const hasVideos = types.some((t) => VIDEO_TYPES.includes(t));
  const hasFiles = types.some((t) => FILE_TYPES.includes(t));

  if (hasAudio) {
    return {
      icons: [],
      text: content && content !== " " ? content : `Голосовое сообщение`,
    };
  }
  // только картинки
  if (hasImages && !hasVideos && !hasFiles) {
    const icons: PreviewIconType[] = Array(Math.min(count, MAX_ICONS_DISPLAY)).fill("photo");
    return {
      icons,
      text: content && content !== " " ? content : `${count} фото`,
    };
  }

  // только видео
  if (hasVideos && !hasImages && !hasFiles) {
    const icons: PreviewIconType[] = Array(Math.min(count, MAX_ICONS_DISPLAY)).fill("video");

    return {
      icons,
      text: content && content !== " " ? content : `${count} видео`,
    };
  }

  // только файлы
  if (hasFiles && !hasImages && !hasVideos) {
    if (count === 1) {
      return {
        icons: [],
        text:
          content && content !== " "
            ? content
            : `${count} ${pluralize(count, "файл", "файла", "файлов")}`,
      };
    }

    const icons: PreviewIconType[] = Array(Math.min(count, MAX_ICONS_DISPLAY)).fill("file");

    return {
      icons,
      text:
        content && content !== " "
          ? content
          : `${count} ${pluralize(count, "файл", "файла", "файлов")}`,
    };
  }

  const icons: PreviewIconType[] = [];

  if (hasImages) icons.push("photo");
  if (hasVideos) icons.push("video");
  if (hasFiles && icons.length < 2) icons.push("file");

  return {
    icons,
    text: content && content !== " " ? content : `${count} медиа`,
  };
};
