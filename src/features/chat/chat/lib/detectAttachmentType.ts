import { AttachmentType } from "../model/store/useChatSendFilesStore";

const VIDEO_TYPES = ["video/"];
const AUDIO_TYPES = ["audio/"];

export const detectAttachmentType = (file: File): AttachmentType => {
  const { type } = file;

  if (VIDEO_TYPES.some((t) => type.startsWith(t))) return "video";
  if (AUDIO_TYPES.some((t) => type.startsWith(t))) return "audio";

  return "document";
};
