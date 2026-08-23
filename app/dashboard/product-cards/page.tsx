import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Plus, Edit2, Trash2, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
// Импортируйте ваши функции и интерфейс из правильного файла (например, @/lib/db)
import { fetchFilteredProducts, fetchProductsPages, deleteProduct, ProductRow } from '@/app/lib/dbActions/productsDBactions';

// Вспомогательная функция для форматирования цен в USD
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
};

// Функция конфигурации внешнего вида статусов
const getStatusConfig = (status: ProductRow['on_stock_status']) => {
  switch (status) {
    case 'available':
      return { 
        text: 'Available', 
        className: 'bg-[#14a34a] text-white', 
        icon: <CheckCircle2 className="w-3.5 h-3.5" /> 
      };
    case 'expected':
      return { 
        text: 'Expected', 
        className: 'bg-[#0b57d0] text-white', 
        icon: <Clock className="w-3.5 h-3.5" /> 
      };
    case 'not_available':
    default:
      return { 
        text: 'Out of Stock', 
        className: 'bg-red-100 text-red-700 border border-red-200', 
        icon: <AlertTriangle className="w-3.5 h-3.5" /> 
      };
  }
};

interface PageProps {
  searchParams: Promise<{
    query?: string;
    page?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: PageProps) {
  // В Next.js 15 searchParams является Promise, поэтому используем await
  const params = await searchParams;
  const query = params?.query ?? '';
  const currentPage = Number(params?.page ?? '1');

  // Запрашиваем данные из БД параллельно
  const [products, totalPages] = await Promise.all([
    fetchFilteredProducts(query, currentPage),
    fetchProductsPages(query),
  ]);

  return (
    
    <div className="w-full min-h-screen bg-gray-50 p-6 font-sans text-[#1a1a1a]">
      {/* <p>НЕОБХОДИМЫ ФУНКЦИОНАЛ: 1.УДАЛИТЬКАРТОЧКУ 2. ДОБАВИТЬ КАРТОЧКУ 3. РЕДАКТИРОВАТЬ КАРТОЧКУ 4. СКРЫТЬ КАРТОЧКУ</p> */}
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-6">
        
        {/* Панель фильтрации: Поиск и Добавление товара */}
        <form method="GET" className="flex items-center justify-between gap-4 mb-6">
          <div className="flex flex-1 max-w-xl border border-gray-200 rounded-lg overflow-hidden h-11 items-center bg-white px-3 focus-within:ring-2 focus-within:ring-blue-100">
            <Search className="text-gray-400 w-5 h-5 mr-2" />
            <input 
              type="text" 
              name="query"
              defaultValue={query}
              placeholder="Search products..." 
              className="w-full outline-none text-sm text-gray-700 bg-transparent placeholder-gray-400"
            />
          </div>
          
          <div className="flex gap-2">
            <button type="submit" className="bg-[#d4df44] hover:bg-[#c2cc3b] text-gray-800 text-sm font-medium px-6 h-11 rounded-lg transition-colors">
              Найти
            </button>
            <Link href="/dashboard/add-product" className="bg-[#0b57d0] hover:bg-[#0a4ebd] text-white text-sm font-medium px-4 h-11 rounded-lg flex items-center gap-2 transition-colors">
              <span>Create Product</span>
              <Plus className="w-4 h-4" />
            </Link>
          </div>
        </form>

        {/* Таблица данных */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="py-4 px-4">Product</th>
                <th className="py-4 px-4">SKU / ID</th>
                <th className="py-4 px-4">Price</th>
                <th className="py-4 px-4">Estimated Date</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-gray-400">
                    Товары не найдены
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const statusInfo = getStatusConfig(product.on_stock_status);
                  // Берем первую картинку из массива image_src, если он существует и не пуст
                  const hasImage = product.image_src && product.image_src.length > 0;
                  const firstImage = hasImage ? product.image_src[0] : null;
                  
                  return (
                    <tr key={product.internal_id} className="hover:bg-gray-50/50 transition-colors">
                      {/* Название, Сорт и Миниатюра */}
                      <td className="py-4 px-4 font-medium text-gray-800 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden relative border border-gray-200 flex-shrink-0 flex items-center justify-center">
                          {firstImage ? (
                            <Image 
                              src={firstImage} 
                              alt={product.crop_sort} 
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          ) : (
                            <span className="text-[10px] text-gray-400 font-bold uppercase">No img</span>
                          )}
                        </div>
                        <div>
                          <div className="text-gray-900 font-semibold">{product.crop_sort}</div>
                          <div className="text-xs text-gray-400">{product.crop_name_eng}</div>
                        </div>
                      </td>
                      
                      {/* Артикул SKU */}
                      <td className="py-4 px-4 text-gray-500 font-mono text-xs">{product.id}</td>
                      
                      {/* Стоимость */}
                      <td className="py-4 px-4 font-medium text-gray-900">
                        {formatCurrency(product.price)}
                      </td>
                      
                      {/* Ожидаемая дата */}
                      <td className="py-4 px-4 text-gray-500">
                        {product.estimated_on_stock_date 
                            ? new Date(product.estimated_on_stock_date).toLocaleDateString('ru-RU') 
                            : '—'}
                      </td>
                      
                      {/* Статус наличия */}
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusInfo.className}`}>
                          {statusInfo.text} {statusInfo.icon}
                        </span>
                      </td>
                      
                      {/* Кнопки действий */}
                      <td className="py-4 px-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <Link 
                            href={`/dashboard/products/${product.internal_id}/edit`}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg border border-gray-200 bg-white transition-all"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>
                          
                          {/* Удаление через встроенный Server Action формы */}
                          <form action={async () => {
                            'use server';
                            await deleteProduct(product.internal_id);
                          }}>
                            <button type="submit" className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg border border-gray-200 bg-white transition-all">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Интерактивная постраничная навигация */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-1 mt-8 pt-4 border-t border-gray-100">
            {/* Кнопка "Назад" */}
            {currentPage > 1 ? (
              <Link 
                href={`?query=${encodeURIComponent(query)}&page=${currentPage - 1}`}
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 bg-white hover:bg-gray-50"
              >
                &larr;
              </Link>
            ) : (
              <span className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-300 bg-white cursor-not-allowed">
                &larr;
              </span>
            )}

            {/* Цикл генерации страниц */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => {
              const isCurrent = pageNumber === currentPage;
              return (
                <Link
                  key={pageNumber}
                  href={`?query=${encodeURIComponent(query)}&page=${pageNumber}`}
                  className={`w-9 h-9 flex items-center justify-center rounded-lg font-medium text-sm transition-colors ${
                    isCurrent 
                      ? 'bg-[#0b57d0] text-white' 
                      : 'text-gray-600 hover:bg-gray-100 border border-transparent bg-white'
                  }`}
                >
                  {pageNumber}
                </Link>
              );
            })}

            {/* Кнопка "Вперед" */}
   {currentPage < totalPages ? (
      <Link 
        href={`?query=${encodeURIComponent(query)}&page=${currentPage + 1}`}
        className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 bg-white hover:bg-gray-50"
      >
        {"->"}
      </Link>
    ) : (
      <span className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-300 bg-white cursor-not-allowed">
        {"->"}
      </span>
    )}
  </div>
)}
     </div>
    </div>
  );
}