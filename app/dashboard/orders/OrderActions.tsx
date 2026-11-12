'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PencilIcon, TrashIcon, EyeIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { deleteOrder } from '@/app/lib/dbActions/ordersDBActions/ordersDBActions';

interface OrderActionsProps {
  orderId: string;
  orderNumber: string;
  yandexRequestId: string | null;
  yandexCancellationStatus: string | null;
}

export default function OrderActions({
  orderId,
  orderNumber,
  yandexRequestId,
  yandexCancellationStatus,
}: OrderActionsProps) {
  const router = useRouter();
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancellationMessage, setCancellationMessage] = useState<string | null>(null);

  const cancellationComplete = yandexCancellationStatus === 'SUCCESS';
  const cancellationPending = yandexCancellationStatus === 'CREATED';

  const cancelYandexDelivery = async () => {
    if (!yandexRequestId || isCancelling || cancellationComplete || cancellationPending) return;
    if (!window.confirm(`Отправить в Яндекс запрос на отмену доставки для заказа #${orderNumber}?`)) return;

    setIsCancelling(true);
    setCancellationMessage(null);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/cancel`, { method: 'POST' });
      const result: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        const message =
          typeof result === 'object' &&
          result !== null &&
          'error' in result &&
          typeof result.error === 'string'
            ? result.error
            : 'Не удалось отменить доставку.';
        throw new Error(message);
      }

      const message =
        typeof result === 'object' &&
        result !== null &&
        'message' in result &&
        typeof result.message === 'string'
          ? result.message
          : 'Запрос на отмену отправлен.';
      setCancellationMessage(message);
      router.refresh();
    } catch (error) {
      setCancellationMessage(error instanceof Error ? error.message : 'Не удалось отменить доставку.');
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="flex flex-wrap justify-end gap-1.5">
      {/* Кнопка просмотра деталей и состава заказа */}
      <Link 
        href={`/dashboard/orders/${orderId}`} 
        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-50 rounded-lg border border-gray-200 transition-all bg-white" 
        title="Состав заказа"
      >
        <EyeIcon className="w-4 h-4" />
      </Link>

      <button
        type="button"
        onClick={cancelYandexDelivery}
        disabled={!yandexRequestId || isCancelling || cancellationComplete || cancellationPending}
        className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs font-medium text-rose-700 transition-all hover:border-rose-200 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
        title={
          !yandexRequestId
            ? 'У заказа нет подтвержденной заявки Яндекс.Доставки'
            : cancellationComplete
              ? 'Доставка отменена'
              : cancellationPending
                ? 'Запрос на отмену уже обрабатывается'
                : 'Отменить доставку через Яндекс'
        }
      >
        <XMarkIcon className="h-4 w-4" />
        {isCancelling
          ? 'Отмена...'
          : cancellationComplete
            ? 'Отменено'
            : cancellationPending
              ? 'Отправлено'
              : 'Отменить'}
      </button>

      {/* Кнопка быстрого изменения статуса */}
      <Link 
        href={`/dashboard/orders/${orderId}/edit`} 
        className="p-2 text-gray-500 hover:text-green-600 hover:bg-gray-50 rounded-lg border border-gray-200 transition-all bg-white" 
        title="Изменить статус"
      >
        <PencilIcon className="w-4 h-4" />
      </Link>
      
      {/* Полностью валидный void action для HTML формы (защита от ошибок TS) */}
      <form action={async () => {
        const isConfirmed = window.confirm(`Вы уверены, что хотите безвозвратно удалить заказ #${orderNumber}?`);
        if (!isConfirmed) return;

        const result = await deleteOrder(orderId);
        if (result.success) {
          router.refresh(); // Мгновенно и плавно обновляем список заказов на сервере
        } else {
          alert(result.error || 'Ошибка удаления');
        }
      }}>
        <button 
          type="submit" 
          className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 rounded-lg border border-gray-200 transition-all bg-white" 
          title="Удалить заказ"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </form>
      {cancellationMessage && (
        <span className="basis-full text-right text-xs text-gray-600" role="status">
          {cancellationMessage}
        </span>
      )}
    </div>
  );
}
