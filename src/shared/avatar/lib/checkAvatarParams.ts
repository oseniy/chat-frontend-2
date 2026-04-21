import { AVATAR_PARAMS } from "./constants";
import { getImageSize } from "./getImageSize";

export const checkAvatarParams = async (
  file: File,
): Promise<{ isValid: boolean; error?: string }> => {
  if (!file) return { isValid: false, error: "Файл не выбран." };
  if (file.size === 0) {
    return { isValid: false, error: "Загружаемый файл пуст." };
  }
  if (!AVATAR_PARAMS.types.includes(file.type)) {
    return {
      isValid: false,
      error: "Недопустимый формат файла. Допустимые форматы: PNG, JPG, JPEG, WebP, SVG.",
    };
  }
  // Проверяем размер файла ПЕРЕД декодированием
  if (file.size > AVATAR_PARAMS.maxSize) {
    const maxSizeMB = (AVATAR_PARAMS.maxSize / (1024 * 1024)).toFixed(1);
    return {
      isValid: false,
      error: `Размер файла слишком большой. Максимальный размер: ${maxSizeMB} МБ.`,
    };
  }
  try {
    const { width, height } = await getImageSize(file);
    if (width < AVATAR_PARAMS.minWidth || height < AVATAR_PARAMS.minHeight) {
      return { isValid: false, error: "Минимальный размер изображения 320x320px" };
    }
  } catch {
    return { isValid: false, error: "Не удалось прочитать изображение" };
  }

  return { isValid: true };
};
