"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import z from "zod";

import { FormInput } from "@/shared/form/ui/formInput";
import { FormTextarea } from "@/shared/form/ui/formTextarea";
import { cn } from "@/shared/shadcn/lib/utils";
import { Button } from "@/shared/shadcn/ui/button";

import { supportSchema } from "../model/schema";

type SupportFormProps = {
  className?: string;
  onSubmit: (data: z.infer<typeof supportSchema>) => Promise<void>;
};

export const SupportForm: React.FC<SupportFormProps> = ({ className, onSubmit }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty, isSubmitting },
  } = useForm<z.infer<typeof supportSchema>>({
    resolver: zodResolver(supportSchema),
    mode: "onChange",
    defaultValues: { email: "", text: "" },
  });

  const emailField = register("email");

  return (
    <form
      className={cn("desktop:gap-0 flex h-full flex-col gap-3", className)}
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      <FormInput
        label="Укажите Ваш e-mail"
        placeholder="e-mail"
        id="email"
        error={errors.email?.message}
        {...emailField}
        onChange={(e) => {
          const raw = e.target.value;
          const value = raw.replace(/\s+/g, "");

          if (!value && raw.length > 0) {
            e.target.value = "";
            return;
          }

          e.target.value = value;
          emailField.onChange(e);
        }}
        className="desktop:mb-3"
      />

      <FormTextarea
        label="Опишите Вашу проблему"
        id="text"
        {...register("text")}
        error={errors.text?.message}
        className="flex-1"
      />

      <p className="minitext font-regular desktop:font-regular text-gray desktop:mb-5 desktop:mt-2">
        Ознакомьтесь со
        <Link
          href="https://achat.ktsf.ru/faq"
          target="_blank"
          className="text-primary desktop:hover:text-primary-light transition-color active:text-primary-light duration-200"
        >
          {" "}
          списком известных проблем и их решениями.
        </Link>
      </p>

      <Button
        type="submit"
        className="w-full"
        variant={"default"}
        size={"lg"}
        disabled={!isValid || !isDirty || isSubmitting}
      >
        Отправить
      </Button>
    </form>
  );
};
