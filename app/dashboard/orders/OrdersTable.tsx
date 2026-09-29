'use client';

import React from 'react';
import OrderActions from '@/app/dashboard/orders/OrderActions'; // Импортируем наши кнопки из отдельного файла

interface OrdersTableProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  orders: any[];
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'new':
      return <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">Новый</span>;
    case 'paid':
      return <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/10">Оплачен</span>;
    case 'processing':
      return <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-800 ring-1 ring-inset ring-amber-600/20">Сборка</span>;
    case 'ready':
      return <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10">Готов</span>;
    case 'shipped':
      return <span className="inline-flex items-center rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10">В доставке</span>;
    case 'delivered':
      return <span className="inline-flex items-center rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-teal-700 ring-1 ring-inset ring-teal-700/10">В ПВЗ</span>;
    case 'recieved':
      return <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">Получен</span>;
    case 'cancelled':
      return <span className="inline-flex items-center rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-medium text-rose-700 ring-1 ring-inset ring-rose-600/10">Отменен</span>;
    case 'refunded':
      return <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">Возврат</span>;
    default:
      return <span className="inline-flex items-center rounded-full bg-gray-50 px-2.5 py-0.5 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">{status}</span>;
  }
};

export default function OrdersTable({ orders }: OrdersTableProps) {
  if (orders.length === 0) {
    return <p className="p-8 text-center text-sm text-gray-500 bg-gray-50 rounded-lg border">Заказы не найдены</p>;
  }

  return (
    <div className="rounded-lg bg-gray-50 p-2 md:pt-0 border border-gray-200/60 shadow-sm">
      
      {/* Мобильный вид (карточки) */}
      <div className="md:hidden space-y-2">
        {orders.map((order) => (
          <div key={order.order_id} className="rounded-xl bg-white p-4 border border-gray-100 shadow-sm">
            <div className="grid gap-1">
              <p className="font-bold text-gray-900">Заказ #{order.order_number}</p>
              <p className="text-sm text-gray-700 font-medium">{order.customer_name}</p>
              <p className="text-xs text-gray-400 font-mono">{order.customer_phone}</p>
              <p className="text-sm font-black text-gray-900 mt-1">{order.total_price} ₽</p>
              <div className="mt-1">{getStatusBadge(order.status)}</div>
            </div>
            <div className="flex justify-end gap-2 mt-3 pt-2 border-t border-gray-50">
              <OrderActions orderId={order.order_id} orderNumber={order.order_number} />
            </div>
          </div>
        ))}
      </div>

      {/* Десктопный вид (таблица) */}
      <table className="hidden min-w-full text-gray-900 md:table bg-white rounded-lg overflow-hidden">
        <thead className="text-left text-sm font-semibold text-gray-600 bg-gray-50/70 border-b">
          <tr>
            <th className="px-6 py-4 font-bold">№ Заказа</th>
            <th className="px-4 py-4">Клиент</th>
            <th className="px-4 py-4">Телефон</th>
            <th className="px-4 py-4">Сумма</th>
            <th className="px-4 py-4">Статус</th>
            <th className="px-4 py-4">Дата создания</th>
            <th className="px-6 py-4 text-right"><span className="sr-only">Действия</span></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 text-sm">
          {orders.map((order) => (
            <tr key={order.order_id} className="hover:bg-gray-50/40 transition-colors">
              <td className="whitespace-nowrap py-4 px-6 font-bold text-gray-900">#{order.order_number}</td>
              <td className="px-4 py-4 text-gray-800 font-medium">{order.customer_name}</td>
              <td className="px-4 py-4 text-gray-500 font-mono text-xs">{order.customer_phone}</td>
              <td className="px-4 py-4 font-bold text-gray-900">{order.total_price} ₽</td>
              <td className="px-4 py-4">{getStatusBadge(order.status)}</td>
              <td className="px-4 py-4 text-gray-400 text-xs">
                {new Date(order.created_at).toLocaleDateString('ru-RU', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </td>
              <td className="py-4 px-6 text-right">
                <OrderActions orderId={order.order_id} orderNumber={order.order_number} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
