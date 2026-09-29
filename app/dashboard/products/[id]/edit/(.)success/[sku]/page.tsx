"use client";

import React from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function ProductUpdatedModal() {
  const router = useRouter();
  const { sku } = useParams<{ sku: string }>();

  // Закрытие модалки уводит администратора обратно в таблицу со всеми карточками
  const handleClose = () => {
    router.push('/dashboard/product-cards');
    router.refresh();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      {/* Подложка */}
      <div className="absolute inset-0" onClick={handleClose} />
      
      {/* Окно уведомления */}
      <div className="relative w-full max-w-sm transform rounded-2xl bg-white p-6 text-center shadow-xl border border-gray-100 animate-in zoom-in-95 duration-200">
        
        {/* Зеленая иконка успеха */}
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mb-4">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-1">
          Изменения сохранены!
        </h3>
        
        <p className="text-sm text-gray-500 mb-4">
          Данные товара успешно обновлены в базе данных.
        </p>

        {/* Вывод SKU */}
        <div className="bg-gray-50 border border-gray-200/60 rounded-xl px-4 py-3 font-mono text-sm text-gray-700 font-bold select-all mb-5 tracking-wide">
          {sku}
        </div>

        {/* Зеленая кнопка подтверждения */}
        <button
          type="button"
          onClick={handleClose}
          className="w-full rounded-xl bg-[#14a34a] px-4 py-3 text-sm font-bold text-white hover:bg-[#118c3f] active:scale-[0.98] transition-all shadow-md shadow-emerald-600/10"
        >
          Отлично
        </button>
      </div>
    </div>
  );
}
