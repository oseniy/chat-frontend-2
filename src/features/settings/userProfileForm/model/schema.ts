import z from "zod";
const currentYear = new Date().getFullYear();
export const changeProfileSchema = z.object({
  name: z
    .string()
    .min(1, "Заполните поле")
    .min(2, "Не менее 2 символов")
    .max(30, "Не более 30 символов"),
  lastName: z
    .string()
    .min(2, "Не менее 2 символов")
    .max(30, "Не более 30 символов")
    .or(z.literal("")),
  phone: z.string().min(2, "Не менее 2 символов").max(30, "Не более 30 символов").optional(),
  description: z.string().min(1).max(140, "Не более 140 символов").or(z.literal("")),
  nickname: z
    .string()
    .min(1, "Заполните поле")
    .min(5, "Не менее 5 символов")
    .max(32, "Не более 32 символов")
    .regex(/^[A-Za-z0-9_-]+$/, {
      message: "Латиница, цифры, тире или подчёркивание",
    })
    .regex(/.*[A-Za-z].*/, {
      message: "Должна быть хотя бы одна буква",
    }),
  birthday: z
    .object({
      day: z
        .number()
        .min(1, "День должен быть от 1 до 31")
        .max(31, "День должен быть от 1 до 31")
        .optional(),
      month: z
        .number()
        .min(1, "Месяц должен быть от 1 до 12")
        .max(12, "Месяц должен быть от 1 до 12")
        .optional(),
      year: z
        .number()
        .min(1900, "Год должен быть ≥1900")
        .max(currentYear, `Год не может быть больше ${currentYear}`)
        .optional(),
    })
    .refine(
      (val) => {
        const { day, month, year } = val;

        if (!day || !month || !year) return true;

        const date = new Date(year, month - 1, day);

        if (
          date.getFullYear() !== year ||
          date.getMonth() !== month - 1 ||
          date.getDate() !== day
        ) {
          return false;
        }

        if (date > new Date()) return false;

        return true;
      },
      { message: "Невалидная дата" },
    )
    .optional(),
});
