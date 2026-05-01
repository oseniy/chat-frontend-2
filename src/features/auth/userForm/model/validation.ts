import { z } from "zod";

const firstNameSchema = z
  .string()
  .transform((val) =>
    val
      .replace(/\s*-\s*/g, "-")
      .replace(/\s{2,}/g, " ")
      .trimStart(),
  )
  .pipe(
    z
      .string()
      .min(1, "Заполните поле")
      .min(2, "Не менее 2 символов")
      .max(30, "Не более 30 символов")
      .regex(/^[A-Za-zА-Яа-яЁё\s-]+$/, {
        message: "Допустимыми символами являются буквы, пробелы и тире",
      })
      .refine((val) => /[A-Za-zА-Яа-яЁё]/.test(val), {
        message: "Имя должно содержать буквы",
      })
      .refine((val) => !/^-|-$/.test(val), {
        message: "Имя не должно начинаться или заканчиваться с тире",
      })
      .refine((val) => !/--/.test(val), {
        message: "Нельзя использовать два тире подряд",
      }),
  );

const nicknameSchema = z
  .string()
  .refine((val) => !/^\s/.test(val), {
    message: "Никнейм не может начинаться с пробела",
  })
  .min(1, "Заполните поле")
  .min(5, "Не менее 5 символов")
  .max(32, "Не более 32 символов")
  .regex(/^[A-Za-z0-9_-]+$/, {
    message: "Допустимы: латиница, цифры, дефис (-) и подчёркивание (_)",
  })
  .refine((val) => /[A-Za-z]/.test(val), {
    message: "Должна быть хотя бы одна буква",
  })
  .refine((val) => !/^[-_]|[-_]$/.test(val), {
    message: "Никнейм не должен начинаться или заканчиваться на - или _",
  })
  .refine((val) => !/--|__/.test(val), {
    message: "Нельзя использовать -- или __ подряд",
  });

const userFormSchema = z.object({
  firstName: firstNameSchema,
  nickname: nicknameSchema,
});

type UserFormData = z.infer<typeof userFormSchema>;

export { firstNameSchema, nicknameSchema, type UserFormData, userFormSchema };
