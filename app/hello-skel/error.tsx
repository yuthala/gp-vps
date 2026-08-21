'use client';

import { useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ProductsError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Здесь можно логировать ошибку в сторонние сервисы (например, Sentry)
    console.error('Ошибка загрузки каталога:', error);
  }, [error]);

  // Проверяем, связана ли ошибка с сетью или БД
  const isNetworkOrDbError = 
    error.message?.toLowerCase().includes('fetch') || 
    error.message?.toLowerCase().includes('database') || 
    error.message?.toLowerCase().includes('connect') ||
    error.message?.toLowerCase().includes('failed');

  return (
    <main className="max-w-7xl mx-auto p-6 min-h-[60vh] flex flex-col items-center justify-center text-center">
      <div className="bg-red-50 p-8 rounded-2xl max-w-md border border-red-100 shadow-sm">
        {/* Иконка предупреждения */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600 mb-5 animate-bounce">
          <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {isNetworkOrDbError ? 'Проблема с подключением' : 'Что-то пошло не так'}
        </h2>
        
        <p className="text-gray-600 mb-6 text-sm leading-relaxed">
          {isNetworkOrDbError 
            ? 'Не удалось связаться с сервером или базой данных. Пожалуйста, проверьте интернет-соединение и попробуйте обновить страницу.'
            : 'Произошла непредвиденная ошибка при загрузке каталога товаров. Наша команда уже работает над этим.'}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            Повторить попытку
          </button>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl transition-colors shadow-sm"
          >
            Обновить страницу
          </button>
        </div>
      </div>
    </main>
  );
}
