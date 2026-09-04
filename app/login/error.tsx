"use client";

import { useEffect } from "react";

export default function LoginError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Логируем критическую ошибку в консоль сервера/клиента для диагностики
    console.error("Критическая ошибка на странице входа:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6 text-center">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-md border border-gray-100 flex flex-col items-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
        </div>
        
        <h3 className="mt-4 font-bold text-gray-900 text-lg">Что-то пошло не так</h3>
        <p className="mt-2 text-sm text-gray-500">
          Не удалось загрузить модуль авторизации. Пожалуйста, попробуйте обновить страницу.
        </p>
        
        <button
          type="button"
          onClick={() => reset()} // Нажатие пытается заново отрендерить маршрут
          className="mt-6 w-full rounded-lg bg-gray-900 py-2.5 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
        >
          Повторить попытку
        </button>
      </div>
    </div>
  );
}
