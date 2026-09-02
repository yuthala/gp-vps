// import { createClientProfile, updateClientProfile } from '@/app/lib/dbActions/usersDBactions';
// import ModalCancelButton from '@/app/ui/dashboard/ModalCancelButton';

// type Customer = {
//   user_id: string;
//   first_name: string;
//   second_name: string;
//   email: string;
//   phone_number: string;
//   bonus_balance: string;
//   discount_group: string;
// };

// export default function CustomerProfileForm({ customer }: { customer?: Customer }) {
//   const isEditing = Boolean(customer);
//   return (
//     <form action={isEditing ? updateClientProfile : createClientProfile} className="grid gap-4">
//       {customer && <input type="hidden" name="user_id" value={customer.user_id} />}
//       <label className="grid gap-1 text-sm font-medium">
//         Имя
//         <input name="first_name" required minLength={1} maxLength={255} defaultValue={customer?.first_name} className="rounded-md border border-gray-300 px-3 py-2" />
//       </label>
//       <label className="grid gap-1 text-sm font-medium">
//         Фамилия
//         <input name="second_name" required minLength={1} maxLength={255} defaultValue={customer?.second_name} className="rounded-md border border-gray-300 px-3 py-2" />
//       </label>
//       <label className="grid gap-1 text-sm font-medium">
//         E-mail
//         <input name="email" required type="email" maxLength={255} defaultValue={customer?.email} className="rounded-md border border-gray-300 px-3 py-2" />
//       </label>
//       <label className="grid gap-1 text-sm font-medium">
//         Телефон
//         <input name="phone_number" required minLength={5} maxLength={30} defaultValue={customer?.phone_number} className="rounded-md border border-gray-300 px-3 py-2" />
//       </label>
//       {customer && (
//         <>
//           <label className="grid gap-1 text-sm font-medium">
//             Бонусы
//             <input name="bonus_balance" required inputMode="decimal" pattern="^\\d+(\\.\\d{1,2})?$" defaultValue={customer.bonus_balance} className="rounded-md border border-gray-300 px-3 py-2" />
//           </label>
//           <label className="grid gap-1 text-sm font-medium">
//             Группа
//             <input name="discount_group" required maxLength={100} defaultValue={customer.discount_group} className="rounded-md border border-gray-300 px-3 py-2" />
//           </label>
//         </>
//       )}
//       <div className="flex justify-end gap-2 pt-2">
//         <ModalCancelButton />
//         <button type="submit" className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500">
//           {isEditing ? 'Сохранить' : 'Добавить'}
//         </button>
//       </div>
//     </form>
//   );
// }

"use client";

import { useState, useEffect } from "react";
import { createClientProfile, updateClientProfile } from '@/app/lib/dbActions/usersDBactions';
import ModalCancelButton from '@/app/ui/dashboard/ModalCancelButton';
import { customerProfileSchema, formatPhone, type ProfileFormData } from "@/app/lib/customerModalUtils";


type Customer = {
  user_id: string;
  first_name: string;
  second_name: string;
  email: string;
  phone_number: string;
  bonus_balance: string;
  discount_group: string;
};

export default function CustomerProfileForm({ customer }: { customer?: Customer }) {
  const isEditing = Boolean(customer);

  // 1. Инициализация состояния на основе переданного клиента
  const [formData, setFormData] = useState({
    first_name: customer?.first_name || "",
    second_name: customer?.second_name || "",
    email: customer?.email || "",
    phone_number: customer?.phone_number ? formatPhone(customer.phone_number) : "",
    bonus_balance: customer?.bonus_balance || "0",
    discount_group: customer?.discount_group || "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof typeof formData, string>>>({});

  // 2. Валидация конкретного поля при изменении или blur
 // Явно указываем тип name как keyof ProfileFormData
const validateField = (name: keyof ProfileFormData, value: string) => {
  // Используем partial-схему для проверки одиночного поля без ручного .pick()
  const result = customerProfileSchema.partial().safeParse({ [name]: value });

  if (!result.success) {
    // Находим ошибку именно для текущего проверяемого поля
    const fieldError = result.error.issues.find(issue => issue.path[0] === name);
    setErrors((prev) => ({ ...prev, [name]: fieldError?.message }));
  } else {
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }
};


  // 3. Обработчик изменений с маской телефона
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let targetValue = value;

    if (name === "phone_number") {
      targetValue = value.length < 3 ? "+7(" : formatPhone(value);
    }

    setFormData((prev) => ({ ...prev, [name]: targetValue }));
    validateField(name as keyof ProfileFormData, targetValue);
  };

  return (
    <form action={isEditing ? updateClientProfile : createClientProfile} className="grid gap-4">
      {customer && <input type="hidden" name="user_id" value={customer.user_id} />}

      {/* Имя */}
      <label className="grid gap-1 text-sm font-medium">
        Имя
        <input 
          name="first_name" 
          type="text"
          value={formData.first_name}
          onChange={handleChange}
          placeholder="Иван"
          className="rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" 
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
          className="rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" 
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
          placeholder="example@domain.com"
          className="rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" 
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
          className="rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" 
        />
        {errors.phone_number && <p className="text-xs text-red-500 mt-1">{errors.phone_number}</p>}
      </label>

      {/* Поля отображаются только при редактировании существующего пользователя */}
      {customer && (
        <>
          <label className="grid gap-1 text-sm font-medium">
            Бонусы
            <input 
              name="bonus_balance" 
              inputMode="decimal" 
              pattern="^\d+(\.\d{1,2})?$" 
              value={formData.bonus_balance}
              onChange={handleChange}
              placeholder="0.00"
              className="rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" 
            />
          </label>
          
          <label className="grid gap-1 text-sm font-medium">
            Группа
            <input 
              name="discount_group" 
              type="text"
              value={formData.discount_group}
              onChange={handleChange}
              placeholder="VIP / Опт"
              className="rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" 
            />
          </label>
        </>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <ModalCancelButton />
        <button 
          type="submit" 
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors"
        >
          {isEditing ? 'Сохранить' : 'Добавить'}
        </button>
      </div>
    </form>
  );
}
