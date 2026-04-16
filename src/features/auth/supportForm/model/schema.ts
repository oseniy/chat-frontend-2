import z from "zod";

export const supportSchema = z.object({
  email: z
    .string()
    .min(1, "Поле не должно быть пустым")
    .max(254, "Не более 254 символов")
    .refine(
      (val) => {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return false;

        const [local, domain] = val.split("@");
        if (!local || !domain) return false;
        if (local.length > 64) return false;
        if (domain.length > 255) return false;

        return true;
      },
      { message: "Некорректный e-mail" },
    ),
  text: z
    .string()
    .transform((val) => val.trim())
    .refine((val) => val.length > 0, {
      message: "Поле не должно быть пустым",
    })
    .refine((val) => val.length <= 500, {
      message: "Не более 500 символов",
    }),
});
