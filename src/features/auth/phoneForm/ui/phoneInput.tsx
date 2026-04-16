import { PatternFormat } from "react-number-format";

import { FormInput } from "@/shared/form/ui/formInput";
import { cn } from "@/shared/shadcn/lib/utils";

type PhoneInputProps = {
  className?: string;
  value: string | undefined;
  id: string;
  onChange: (value: string) => void;
  error?: string;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
  disabled?: boolean;
  autoFocus?: boolean; // Тип уже на месте, это хорошо
};

export const PhoneInput: React.FC<PhoneInputProps> = ({
  className,
  value,
  id,
  error,
  onBlur,
  onFocus,
  onChange,
  disabled,
  autoFocus, // 1. Добавляем сюда получение пропса
}) => {
  return (
    <div className={cn("", className)}>
      <PatternFormat
        className={cn("", className)}
        customInput={FormInput}
        id={id}
        label="Введите номер телефона"
        format="+7 ### ### ## ##"
        value={value}
        error={error}
        placeholder="+7 900 000 00 00"
        onValueChange={(v) => onChange(v.formattedValue)}
        onBlur={onBlur}
        onFocus={onFocus}
        disabled={disabled}
        autoFocus={autoFocus}
      />
    </div>
  );
};
