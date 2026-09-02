
"use client";

import { useState, useActionState } from "react";
import { useRouter } from "next/navigation";
import { createStaffProfile, updateStaffProfile } from '@/app/lib/dbActions/usersDBactions';
import ModalCancelButton from '@/app/ui/dashboard/ModalCancelButton';
import { formatPhone, staffProfileSchema, type StaffFormData } from "@/app/lib/staffModalUtils";

import StatusOverlay from "./StatusOverlay";
import ErrorOverlay from "./ErrorOverlay";

type Staff = {
  user_id: string;
  first_name: string;
  second_name: string;
  email: string;
  phone_number: string;
  position: string;
  salary: string;
  hire_date: Date;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function formActionHandler(prevState: any, formData: FormData) {
  const isEditing = Boolean(formData.get('user_id'));
  if (isEditing) {
    return await updateStaffProfile(formData);
  } else {
    return await createStaffProfile(formData);
  }
}

export default function StaffProfileForm({ member, onClose }: { member?: Staff; onClose?: () => void }) {
  const isEditing = Boolean(member);
  const router = useRouter();

  // Использование useActionState для управления отправкой формы
  const [state, formAction, isPending] = useActionState(formActionHandler, null);
  
  // Состояния скрытия экранов
  const [dismissedError, setDismissedError] = useState<string | null>(null);
  const [successDismissed, setSuccessDismissed] = useState(false);

  // Состояние данных полей ввода
  const [formData, setFormData] = useState({
    role: "staff",
    first_name: member?.first_name || "",
    second_name: member?.second_name || "",
    email: member?.email || "",
    phone_number: member?.phone_number ? formatPhone(member.phone_number) : "",
    position: member?.position || "",
    salary: member?.salary || "",
    hire_date: member ? new Date(member.hire_date).toISOString().slice(0, 10) : "",
  });

  // Локальные ошибки валидации Zod на клиенте
  const [errors, setErrors] = useState<Partial<Record<keyof typeof formData, string>>>({});

  // Декларативное вычисление состояний оверлеев
  const isSuccess = state?.ok === true && !successDismissed;
  const currentServerError = state?.error || null;
  const serverError = currentServerError && currentServerError !== dismissedError ? currentServerError : null;

  // Валидация одного поля на лету
  const validateField = (name: keyof StaffFormData, value: string) => {
    const result = staffProfileSchema.partial().safeParse({ [name]: value });
    if (!result.success) {
      const fieldError = result.error.issues.find(
        (issue) => String(issue.path) === name
      );
      setErrors((prev) => ({ ...prev, [name]: fieldError?.message }));
    } else {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Обработчик изменения инпутов + маска телефона
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let targetValue = value;

    if (name === "phone_number") {
      targetValue = value.length < 3 ? "+7(" : formatPhone(value);
    }

    setFormData((prev) => ({ ...prev, [name]: targetValue }));
    validateField(name as keyof StaffFormData, targetValue);
  };

  // Метод, срабатывающий при закрытии экрана успеха
  const handleSuccessClose = () => {
    setSuccessDismissed(true);
    if (onClose) {
      onClose();
    } else {
      router.back();
    }
  };

  // Сброс флагов скрытия перед отправкой
  const handleSubmitClick = () => {
    setSuccessDismissed(false);
    setDismissedError(null);
  };

  return (
    <div className="relative">
      
      {/* Анимация загрузки и успеха */}
      <StatusOverlay 
        isPending={isPending} 
        isSuccess={isSuccess} 
        pendingText={isEditing ? "Сохраняем изменения..." : "Сохраняем данные нового сотрудника..."}
        onClose={handleSuccessClose}
      />

      {/* Окно серверной ошибки */}
      <ErrorOverlay 
        error={serverError} 
        onRetry={() => setDismissedError(currentServerError)} 
      />

      <form action={formAction} onSubmit={handleSubmitClick} className="grid gap-4">
        {member && <input type="hidden" name="user_id" value={member.user_id} />}

        {/* Роль */}
        <label className="grid gap-1 text-sm font-medium">
          Роль
          <select 
            name="role" 
            value={formData.role} 
            onChange={handleChange}
            className="rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none"
          >
            <option value="staff">Сотрудник</option>
            <option value="admin">Администратор</option>
          </select>
          {errors.role && <p className="text-xs text-red-500 mt-1">{errors.role}</p>}
        </label>

        {/* Имя */}
        <label className="grid gap-1 text-sm font-medium">
          Имя
          <input 
            name="first_name" 
            type="text"
            value={formData.first_name}
            onChange={handleChange}
            placeholder="Иван"
            className="rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none" 
          />
          {errors.first_name && <p className="text-xs text-red-500 mt-1">{errors.first_name}</p>}
        </label>

        {/* Фамилия */}
        <label className="grid gap-1 text-sm font-medium">
          Фамилия
          <input 
            name="second_name" 
            type="text"
            value={formData.second_name}
            onChange={handleChange}
            placeholder="Иванов"
            className="rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none" 
          />
          {errors.second_name && <p className="text-xs text-red-500 mt-1">{errors.second_name}</p>}
        </label>

        {/* E-mail */}
        <label className="grid gap-1 text-sm font-medium">
          E-mail
          <input 
            name="email" 
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="staff@domain.com"
            className="rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none" 
          />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
        </label>

        {/* Телефон */}
        <label className="grid gap-1 text-sm font-medium">
          Телефон
          <input 
            name="phone_number" 
            type="text"
            value={formData.phone_number}
            onChange={handleChange}
            placeholder="+7(999) 000 - 00 - 00"
            className="rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none" 
          />
          {errors.phone_number && <p className="text-xs text-red-500 mt-1">{errors.phone_number}</p>}
        </label>

        {/* Должность */}
        <label className="grid gap-1 text-sm font-medium">
          Должность
          <input 
            name="position" 
            type="text"
            value={formData.position}
            onChange={handleChange}
            placeholder="Менеджер по продажам"
            className="rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none" 
          />
          {errors.position && <p className="text-xs text-red-500 mt-1">{errors.position}</p>}
        </label>

        {/* Зарплата */}
        <label className="grid gap-1 text-sm font-medium">
          Зарплата
          <input 
            name="salary" 
            type="number"
            min="0"
            step="0.01"
            value={formData.salary}
            onChange={handleChange}
            placeholder="50000.00"
            className="rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none" 
          />
          {errors.salary && <p className="text-xs text-red-500 mt-1">{errors.salary}</p>}
        </label>

        {/* Дата приёма */}
        <label className="grid gap-1 text-sm font-medium">
          Дата приёма
          <input 
            name="hire_date" 
            type="date"
            value={formData.hire_date}
            onChange={handleChange}
            className="rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none" 
          />
          {errors.hire_date && <p className="text-xs text-red-500 mt-1">{errors.hire_date}</p>}
        </label>

        {/* Кнопки */}
        <div className="flex justify-end gap-2 pt-2">
          <ModalCancelButton />
          <button 
            type="submit" 
            disabled={isPending}
            className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-500 transition-colors disabled:opacity-50"
          >
            {isEditing ? 'Сохранить' : 'Добавить'}
          </button>
        </div>
      </form>
    </div>
  );
}
