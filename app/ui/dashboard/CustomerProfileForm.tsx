
// "use client";

// import { useState, useActionState } from "react";
// //import { useRouter } from "next/navigation";
// import { createClientProfile, updateClientProfile } from '@/app/lib/dbActions/usersDBactions';
// import ModalCancelButton from '@/app/ui/dashboard/ModalCancelButton';
// import { formatPhone, customerProfileSchema, type ProfileFormData } from "@/app/lib/customerModalUtils";

// import StatusOverlay from "./StatusOverlay";
// import ErrorOverlay from "./ErrorOverlay";

// type Customer = {
//   user_id: string;
//   first_name: string;
//   second_name: string;
//   email: string;
//   phone_number: string;
//   bonus_balance: string;
//   discount_group: string;
// };

// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// async function formActionHandler(prevState: any, formData: FormData) {
//   const isEditing = Boolean(formData.get('user_id'));
//   if (isEditing) {
//     return await updateClientProfile(formData);
//   } else {
//     return await createClientProfile(formData);
//   }
// }

// export default function CustomerProfileForm({ customer, onClose }: { customer?: Customer; onClose?: () => void }) {
//   const isEditing = Boolean(customer);
//   const [state, formAction, isPending] = useActionState(formActionHandler, null);
//   const [dismissedError, setDismissedError] = useState<string | null>(null);

//   const [formData, setFormData] = useState({
//     first_name: customer?.first_name || "",
//     second_name: customer?.second_name || "",
//     email: customer?.email || "",
//     phone_number: customer?.phone_number ? formatPhone(customer.phone_number) : "",
//     bonus_balance: customer?.bonus_balance || "0",
//     discount_group: customer?.discount_group || "",
//   });

//   const [errors, setErrors] = useState<Partial<Record<keyof typeof formData, string>>>({});

//   const isSuccess = state?.ok === true;
//   const currentServerError = state?.error || null;
  
//   // ИСПРАВЛЕНИЕ: Прямое и безопасное сравнение строк
//   const serverError = currentServerError && currentServerError !== dismissedError ? currentServerError : null;

//   const validateField = (name: keyof ProfileFormData, value: string) => {
//     const result = customerProfileSchema.partial().safeParse({ [name]: value });
//     if (!result.success) {
//       // ИСПРАВЛЕНИЕ: Приводим элемент пути к строке через String(), чтобы избежать несовпадения типов (string | number)[]
//       const fieldError = result.error.issues.find(
//         (issue) => String(issue.path[0]) === name
//       );
//       setErrors((prev) => ({ ...prev, [name]: fieldError?.message }));
//     } else {
//       setErrors((prev) => ({ ...prev, [name]: undefined }));
//     }
//   };

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     let targetValue = value;

//     if (name === "phone_number") {
//       targetValue = value.length < 3 ? "+7(" : formatPhone(value);
//     }

//     setFormData((prev) => ({ ...prev, [name]: targetValue }));
//     validateField(name as keyof ProfileFormData, targetValue);
//   };

//   return (
//     <div className="relative">
      
//       <StatusOverlay 
//         isPending={isPending} 
//         isSuccess={isSuccess} 
//         pendingText={isEditing ? "Сохраняем изменения..." : "Сохраняем данные нового клиента..."}
//         onClose={onClose}
//       />

//       <ErrorOverlay 
//         error={serverError} 
//         onRetry={() => setDismissedError(currentServerError)} 
//       />

//       <form action={formAction} className="grid gap-4">
//         {customer && <input type="hidden" name="user_id" value={customer.user_id} />}

//         <label className="grid gap-1 text-sm font-medium">
//           Имя
//           <input 
//             name="first_name" 
//             type="text"
//             value={formData.first_name}
//             onChange={handleChange}
//             placeholder="Иван"
//             className="rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" 
//           />
//           {errors.first_name && <p className="text-xs text-red-500 mt-1">{errors.first_name}</p>}
//         </label>

//         <label className="grid gap-1 text-sm font-medium">
//           Фамилия
//           <input 
//             name="second_name" 
//             type="text"
//             value={formData.second_name}
//             onChange={handleChange}
//             placeholder="Иванов"
//             className="rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" 
//           />
//           {errors.second_name && <p className="text-xs text-red-500 mt-1">{errors.second_name}</p>}
//         </label>

//         <label className="grid gap-1 text-sm font-medium">
//           E-mail
//           <input 
//             name="email" 
//             type="email"
//             value={formData.email}
//             onChange={handleChange}
//             placeholder="example@domain.com"
//             className="rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" 
//           />
//           {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
//         </label>

//         <label className="grid gap-1 text-sm font-medium">
//           Телефон
//           <input 
//             name="phone_number" 
//             type="text"
//             value={formData.phone_number}
//             onChange={handleChange}
//             placeholder="+7(999) 000 - 00 - 00"
//             className="rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" 
//           />
//           {errors.phone_number && <p className="text-xs text-red-500 mt-1">{errors.phone_number}</p>}
//         </label>

//         {customer && (
//           <>
//             <label className="grid gap-1 text-sm font-medium">
//               Бонусы
//               <input 
//                 name="bonus_balance" 
//                 inputMode="decimal" 
//                 pattern="^\d+(\.\d{1,2})?$" 
//                 value={formData.bonus_balance}
//                 onChange={handleChange}
//                 placeholder="0.00"
//                 className="rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" 
//               />
//             </label>
            
//             <label className="grid gap-1 text-sm font-medium">
//               Группа
//               <input 
//                 name="discount_group" 
//                 type="text"
//                 value={formData.discount_group}
//                 onChange={handleChange}
//                 placeholder="VIP / Опт"
//                 className="rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" 
//               />
//             </label>
//           </>
//         )}

//         <div className="flex justify-end gap-2 pt-2">
//           <ModalCancelButton />
//           <button 
//             type="submit" 
//             disabled={isPending}
//             className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors disabled:opacity-50"
//           >
//             {isEditing ? 'Сохранить' : 'Добавить'}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// }

"use client";

import { useState, useActionState } from "react";
import { useRouter } from "next/navigation";
import { createClientProfile, updateClientProfile } from '@/app/lib/dbActions/usersDBactions';
import ModalCancelButton from '@/app/ui/dashboard/ModalCancelButton';
import { formatPhone, customerProfileSchema, type ProfileFormData } from "@/app/lib/customerModalUtils";

import StatusOverlay from "./StatusOverlay";
import ErrorOverlay from "./ErrorOverlay";

type Customer = {
  user_id: string;
  first_name: string;
  second_name: string;
  email: string;
  phone_number: string;
  bonus_balance: string;
  discount_group: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function formActionHandler(prevState: any, formData: FormData) {
  const isEditing = Boolean(formData.get('user_id'));
  if (isEditing) {
    return await updateClientProfile(formData);
  } else {
    return await createClientProfile(formData);
  }
}

export default function CustomerProfileForm({ customer, onClose }: { customer?: Customer; onClose?: () => void }) {
  const isEditing = Boolean(customer);
  const router = useRouter();

  // Использование useActionState для управления отправкой формы
  const [state, formAction, isPending] = useActionState(formActionHandler, null);
  
  // Состояния скрытия экранов
  const [dismissedError, setDismissedError] = useState<string | null>(null);
  const [successDismissed, setSuccessDismissed] = useState(false);

  // Состояние данных полей ввода
  const [formData, setFormData] = useState({
    first_name: customer?.first_name || "",
    second_name: customer?.second_name || "",
    email: customer?.email || "",
    phone_number: customer?.phone_number ? formatPhone(customer.phone_number) : "",
    bonus_balance: customer?.bonus_balance || "0",
    discount_group: customer?.discount_group || "",
  });

  // Локальные ошибки валидации Zod на клиенте
  const [errors, setErrors] = useState<Partial<Record<keyof typeof formData, string>>>({});

  // ─── ЧИСТОЕ ДЕКЛАРАТИВНОЕ ВЫЧИСЛЕНИЕ СОСТОЯНИЙ (БЕЗ USEEFFECT) ───
  const isSuccess = state?.ok === true && !successDismissed;
  const currentServerError = state?.error || null;
  const serverError = currentServerError && currentServerError !== dismissedError ? currentServerError : null;

  // Валидация одного поля на лету
  const validateField = (name: keyof ProfileFormData, value: string) => {
    const result = customerProfileSchema.partial().safeParse({ [name]: value });
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
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let targetValue = value;

    if (name === "phone_number") {
      targetValue = value.length < 3 ? "+7(" : formatPhone(value);
    }

    setFormData((prev) => ({ ...prev, [name]: targetValue }));
    validateField(name as keyof ProfileFormData, targetValue);
  };

  // Метод, срабатывающий при закрытии экрана успеха
 const handleSuccessClose = () => {
  setSuccessDismissed(true); // Скрываем внутренний оверлей успеха
  
  if (onClose) {
    onClose(); // Если пропс передан, вызываем его
  } else {
    router.back(); // ИНАЧЕ ДЛЯ INTERCEPTING ROUTES: возвращаемся назад, что закрывает модалку
  }
};

  // ИСПРАВЛЕНИЕ: Сбрасываем флаги скрытия при отправке новой формы через обычное событие клика/сабмита
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
        pendingText={isEditing ? "Сохраняем изменения..." : "Сохраняем данные нового клиента..."}
        onClose={handleSuccessClose}
      />

      {/* Окно серверной ошибки */}
      <ErrorOverlay 
        error={serverError} 
        onRetry={() => setDismissedError(currentServerError)} 
      />

      {/* Добавляем onSubmit для гарантированного сброса стейтов перед началом экшена */}
      <form action={formAction} onSubmit={handleSubmitClick} className="grid gap-4">
        {customer && <input type="hidden" name="user_id" value={customer.user_id} />}

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
            disabled={isPending}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors disabled:opacity-50"
          >
            {isEditing ? 'Сохранить' : 'Добавить'}
          </button>
        </div>
      </form>
    </div>
  );
}
