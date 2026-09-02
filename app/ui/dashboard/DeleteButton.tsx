"use client";

import { useActionState, useState } from "react";
import { TrashIcon } from '@heroicons/react/24/outline';
import { deleteClientProfile } from '@/app/lib/dbActions/usersDBactions';
import StatusOverlay from "./StatusOverlay";
import ErrorOverlay from "./ErrorOverlay";

interface DeleteCustomerButtonProps {
  userId: string;
}

// Строго описываем тип состояния для useActionState
type ActionState = {
  ok?: boolean;
  error?: string;
} | null;

export default function DeleteCustomerButton({ userId }: DeleteCustomerButtonProps) {
  // Инициализируем хук с явным дженериком и возвращаем промис через return
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    async (prevState, formData) => {
      return await deleteClientProfile(formData);
    }, 
    null
  );

  const [dismissedError, setDismissedError] = useState<string | null>(null);
  const [successDismissed, setSuccessDismissed] = useState(false);

  // Сброс локальных флагов скрытия перед новой отправкой формы
  const handleSubmitClick = () => {
    setSuccessDismissed(false);
    setDismissedError(null);
  };

  // Вычисляемые состояния (Декларативный подход, без useEffect)
  const isSuccess = state?.ok === true && !successDismissed;
  const currentServerError = state?.error || null;
  const serverError = currentServerError && currentServerError !== dismissedError ? currentServerError : null;

  return (
    <>
      {/* 1. Модальное окно загрузки и успеха по центру экрана */}
      <StatusOverlay 
        isPending={isPending} 
        isSuccess={isSuccess} 
        pendingText="Удаляем профиль клиента..."
        successText="Клиент успешно удален!"
        onClose={() => setSuccessDismissed(true)}
      />

      {/* 2. Модальное окно ошибки по центру экрана */}
      <ErrorOverlay 
        error={serverError} 
        onRetry={() => setDismissedError(currentServerError)} 
      />

      {/* 3. Кнопка удаления */}
      <form action={formAction} onSubmit={handleSubmitClick}>
        <input type="hidden" name="user_id" value={userId} />
        <button 
          type="submit" 
          disabled={isPending}
          className="rounded-md border border-gray-200 p-2 text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50" 
          title="Удалить клиента"
        >
          <TrashIcon className="w-5 h-5" />
        </button>
      </form>
    </>
  );
}


