import { z } from "zod";

/**
 * Схема валидации Zod для формы профиля клиента (CustomerProfileForm)
 * Полностью соответствует именам полей из базы данных
 */
export const customerProfileSchema = z.object({
  first_name: z
    .string()
    .min(1, "Поле обязательно: введите имя")
    .max(255, "Имя слишком длинное (максимум 255 символов)"),
  
  second_name: z
    .string()
    .min(1, "Поле обязательно: введите фамилию")
    .max(255, "Фамилия слишком длинная (максимум 255 символов)"),
  
  email: z
    .string()
    .min(1, "Поле обязательно для заполнения")
    .email("Неверный формат: пример email@domain.com")
    .max(255, "Email слишком длинный"),
  
  phone_number: z.string().refine((val) => {
    const digits = val.replace(/\D/g, "");
    return digits.length === 11;
  }, "Номер телефона заполнен не полностью: должно быть 11 цифр"),
  
  bonus_balance: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Неверный формат бонусов (пример: 100 или 100.50)")
    .optional(),
    
  discount_group: z
    .string()
    .max(100, "Название группы слишком длинное")
    .optional(),
});

// Выведение типа на основе схемы Zod для использования в React-компоненте
export type ProfileFormData = z.infer<typeof customerProfileSchema>;

/**
 * Функция форматирования номера телефона в маску +7(XXX) XXX - XX - XX
 * Автоматически очищает лишние символы при вводе
 */
export const formatPhone = (value: string): string => {
  const digits = value.replace(/\D/g, "");
  let cleaned = digits;
  
  // Если ввод начинается с 7 или 8, отсекаем первую цифру для корректного форматирования
  if (cleaned.startsWith("7") || cleaned.startsWith("8")) {
    cleaned = cleaned.substring(1);
  }

  // Ограничиваем длину до 10 знаков кода и номера
  cleaned = cleaned.substring(0, 10);

  let formatted = "+7";
  if (cleaned.length > 0) {
    formatted += `(${cleaned.substring(0, 3)}`;
  } else {
    formatted += "(";
  }
  if (cleaned.length >= 3) {
    formatted += `) ${cleaned.substring(3, 6)}`;
  }
  if (cleaned.length >= 6) {
    formatted += ` - ${cleaned.substring(6, 8)}`;
  }
  if (cleaned.length >= 8) {
    formatted += ` - ${cleaned.substring(8, 10)}`;
  }

  return formatted;
};

