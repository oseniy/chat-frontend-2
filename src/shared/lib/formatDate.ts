export const formatDate = (timestamp: number | string | undefined): string => {
  if (!timestamp) return "";

  let ms = Number(timestamp);

  // ПРОВЕРКА: Если число меньше 10^12, значит это секунды (Unix)
  // Мы умножаем их на 1000, чтобы получить миллисекунды для JS
  if (ms < 10000000000) {
    ms *= 1000;
  }

  return new Date(ms).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};
