import React from 'react';
import { lusitana } from '@/app/ui/fonts';
import { fetchFilteredOrders } from '@/app/lib/dbActions/ordersDBActions/ordersDBActions';

// Импортируем новый клиентский компонент таблицы, который мы создадим на Шаге 2
import OrdersTable from '@/app/dashboard/orders/OrdersTable';

interface PageProps {
  searchParams: Promise<{ query?: string }>;
}

export default async function OrdersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = params.query ?? '';
  
  // Серверный безопасный запрос к базе данных PostgreSQL
  const orders = await fetchFilteredOrders(query);

  return (
    <div className="w-full min-h-screen bg-gray-50/30 p-4 md:p-8">
      <h1 className={`${lusitana.className} text-2xl font-bold text-gray-900`}>Заказы</h1>

      {/* Форма поиска */}
      <form method="GET" className="mt-4 flex items-center gap-2 md:mt-8">
        <input 
          name="query" 
          defaultValue={query} 
          placeholder="Поиск по имени, телефону или номеру заказа..." 
          className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-green-500 md:max-w-md bg-white text-gray-900" 
        />
        <button type="submit" className="h-10 rounded-lg bg-green-600 px-4 text-sm font-medium text-white hover:bg-green-500 transition-colors">
          Найти
        </button>
      </form>

      {/* Передаем полученные с сервера заказы в изолированную клиентскую таблицу */}
      <div className="mt-6 flow-root">
        <div className="inline-block min-w-full align-middle">
          <OrdersTable orders={orders} />
        </div>
      </div>
    </div>
  );
}

