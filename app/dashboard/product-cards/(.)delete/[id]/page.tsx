"use client";

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { deleteProduct } from '@/app/lib/dbActions/productsDBactions';

export default function DeleteProductModal() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>(); // Получаем internal_id из URL
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Закрытие модального окна без удаления (возвращает на шаг назад по истории роутера)
  const handleClose = () => {
    router.back();
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setErrorMessage(null);
    
    try {
      // Вызываем ваше серверное действие удаления товара
      await deleteProduct(id);
      
      // Обновляем текущую страницу для отображения актуального списка без удаленного товара
      router.refresh();
      // Закрываем оверлей
      router.back();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setErrorMessage(error.message || 'Не удалось удалить товар');
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      
      {/* Задний фон-подложка закрывает модалку при клике мимо окна */}
      <div className="absolute inset-0" onClick={handleClose} />

      {/* Окно модалки */}
      <div className="relative w-full max-w-md transform rounded-2xl bg-white p-6 shadow-xl border border-gray-100 transition-all animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center">
          
          {/* Иконка предупреждения */}
          <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600 mb-4">
            <AlertTriangle className="h-6 w-6" aria-hidden="true" />
          </div>

          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Удаление карточки товара
          </h3>
          
          <p className="text-sm text-gray-500 mb-4">
            Вы уверены, что хотите полностью удалить этот товар? Это действие необратимо и сотрет данные из базы.
          </p>

          {errorMessage && (
            <p className="w-full text-xs text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-100 mb-4 font-medium">
              {errorMessage}
            </p>
          )}

          {/* Кнопки управления */}
          <div className="w-full flex items-center gap-3 mt-2">
            <button
              type="button"
              disabled={isDeleting}
              onClick={handleClose}
              className="flex-1 rounded-xl bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-100 border border-gray-200 active:scale-[0.98] transition-all"
            >
              Отмена
            </button>
            <button
              type="button"
              disabled={isDeleting}
              onClick={handleDelete}
              className="flex-1 rounded-xl bg-rose-600 px-4 py-3 text-sm font-bold text-white shadow-md shadow-rose-600/10 hover:bg-rose-700 disabled:bg-gray-300 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {isDeleting ? (
                'Удаление...'
              ) : (
                <>
                  <span>Удалить</span>
                  <Trash2 className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
