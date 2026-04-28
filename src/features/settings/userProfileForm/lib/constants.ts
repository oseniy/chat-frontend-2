export const MONTHS = [
  { value: 1, label: "Января" },
  { value: 2, label: "Февраля" },
  { value: 3, label: "Марта" },
  { value: 4, label: "Апреля" },
  { value: 5, label: "Мая" },
  { value: 6, label: "Июня" },
  { value: 7, label: "Июля" },
  { value: 8, label: "Августа" },
  { value: 9, label: "Сентября" },
  { value: 10, label: "Октября" },
  { value: 11, label: "Ноября" },
  { value: 12, label: "Декабря" },
] as const;

export const DAYS = Array.from({ length: 31 }, (_, i) => ({
  value: i + 1,
  label: String(i + 1),
}));

const CURRENT_YEAR = new Date().getFullYear();

export const YEARS = Array.from({ length: CURRENT_YEAR - 1950 + 1 }, (_, i) => {
  const year = CURRENT_YEAR - i;
  return {
    value: year,
    label: String(year),
  };
});

export const GENDERS = [
  { value: "male", label: "Мужской" },
  { value: "female", label: "Женский" },
] as const;
