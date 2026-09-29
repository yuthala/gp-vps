'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import { deleteOrder } from '@/app/lib/dbActions/ordersDBActions/ordersDBActions';

interface OrderActionsProps {
  orderId: string;
  orderNumber: number;
}

export default function OrderActions({ orderId, orderNumber }: OrderActionsProps) {
  const router = useRouter();

  return (
    <div className="flex justify-end gap-1.5">
      {/* Кнопка просмотра деталей и состава заказа */}
      <Link 
        href={`/dashboard/orders/${orderId}`} 
        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-50 rounded-lg border border-gray-200 transition-all bg-white" 
        title="Состав заказа"
      >
        <EyeIcon className="w-4 h-4" />
      </Link>

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
    </div>
  );
}
