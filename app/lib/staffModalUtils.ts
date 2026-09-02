// @/app/lib/staffModalUtils.ts
import { z } from "zod";

export const staffProfileSchema = z.object({
  role: z.string().min(1, "Выберите роль"),
  first_name: z.string().min(1, "Поле обязательно: введите имя").max(255),
  second_name: z.string().min(1, "Поле обязательно: введите фамилию").max(255),
  email: z.string().min(1, "Поле обязательно").email("Неверный формат email").max(255),
  phone_number: z.string().refine((val) => {
    const digits = val.replace(/\D/g, "");
    return digits.length === 11;
  }, "Номер телефона должен содержать 11 цифр"),
  position: z.string().min(1, "Поле обязательно: введите должность").max(255),
  salary: z.string().min(1, "Поле обязательно: укажите зарплату"),
  hire_date: z.string().min(1, "Поле обязательно: выберите дату"),
});

export type StaffFormData = z.infer<typeof staffProfileSchema>;

export const formatPhone = (value: string): string => {
  const digits = value.replace(/\D/g, "");
  let cleaned = digits;
  if (cleaned.startsWith("7") || cleaned.startsWith("8")) {
    cleaned = cleaned.substring(1);
  }
  cleaned = cleaned.substring(0, 10);

  let formatted = "+7";
  if (cleaned.length > 0) formatted += `(${cleaned.substring(0, 3)}`;
  else formatted += "(";
  if (cleaned.length >= 3) formatted += `) ${cleaned.substring(3, 6)}`;
  if (cleaned.length >= 6) formatted += ` - ${cleaned.substring(6, 8)}`;
  if (cleaned.length >= 8) formatted += ` - ${cleaned.substring(8, 10)}`;

  return formatted;
};
