
  // type User = { id: string | number; name: string; email?: string };

  // const res = await fetch('http://localhost:3000/api/hello');
  // const data = (await res.json()) as User[];
  // console.log(data);
  // return (
  //   <ul>
  //     {data.map((user) => (
  //       <li key={user.id}>{user.name} - {user.email}</li>
  //     ))}
  //   </ul>
  // );

  import React, { Suspense } from 'react';
import { fetchAllProducts } from '@/app/lib/dbActions/productsDBactions'; // Укажите ваш правильный путь к функции
import { ProductCard } from '@/app/lib/definitions'; // Укажите ваш путь к типам

// 1. КОМПОНЕНТ-СКЕЛЕТОН (Заглушка во время загрузки)
export function ProductsSkeleton() {
  const skeletonCards = Array.from({ length: 8 });

  // Чистый и красивый класс для Tailwind v4
  const shimmer =
    'before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
      {skeletonCards.map((_, index) => (
        <div 
          key={index} 
          className="border border-gray-100 rounded-lg p-4 flex flex-col justify-between bg-white shadow-sm"
        >
          <div>
            {/* Картинка-заглушка */}
            <div className={`aspect-square w-full relative bg-gray-200 rounded-md overflow-hidden mb-4 ${shimmer}`} />
            
            {/* Тег сорта */}
            <div className={`h-5 w-20 bg-gray-200 rounded-full relative overflow-hidden ${shimmer}`} />
            
            {/* Название товара */}
            <div className={`h-5 w-5/6 bg-gray-200 rounded mt-3 relative overflow-hidden ${shimmer}`} />
            <div className={`h-5 w-1/2 bg-gray-200 rounded mt-1 relative overflow-hidden ${shimmer}`} />
            
            {/* Описание товара */}
            <div className="space-y-1.5 mt-3">
              <div className={`h-3 w-full bg-gray-200 rounded relative overflow-hidden ${shimmer}`} />
              <div className={`h-3 w-4/5 bg-gray-200 rounded relative overflow-hidden ${shimmer}`} />
            </div>
          </div>

          {/* Футер карточки (Цена + Статус) */}
          <div className="mt-5 pt-4 border-t border-gray-50 flex items-center justify-between">
            <div className={`h-6 w-24 bg-gray-200 rounded relative overflow-hidden ${shimmer}`} />
            <div className={`h-5 w-20 bg-gray-200 rounded relative overflow-hidden ${shimmer}`} />
          </div>
        </div>
      ))}
    </div>
  );
}



// 2. АСИНХРОННЫЙ КОМПОНЕНТ ДЛЯ ЗАГРУЗКИ ДАННЫХ
async function ProductsList() {
  // Прямой вызов серверной функции получения данных
  const products: ProductCard[] = await fetchAllProducts();

  if (!products || products.length === 0) {
    return <div className="text-center py-10 text-gray-500">Товары не найдены</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <div key={product.id} className="border border-gray-200 rounded-lg p-4 flex flex-col justify-between hover:shadow-lg transition-shadow bg-white">
          <div>
            {/* Отображаем первую картинку из массива */}
            <div className="aspect-square w-full relative bg-gray-100 rounded-md overflow-hidden mb-4">
              {product.imageSrc && product.imageSrc[0] ? (
                <img 
                  src={product.imageSrc[0]} 
                  alt={product.cropName} 
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">Нет фото</div>
              )}
            </div>
            
            <span className="text-xs font-semibold px-2 py-1 bg-green-50 text-green-700 rounded-full">
              {product.cropSort}
            </span>
            <h3 className="font-bold text-lg mt-2 text-gray-950">{product.cropName}</h3>
            <p className="text-gray-600 text-sm mt-1 line-clamp-2">{product.description}</p>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xl font-bold text-gray-900">{product.price} ₽</span>
            <span className={`text-xs px-2 py-1 rounded ${
              product.onStockStatus === 'available' ? 'bg-emerald-100 text-emerald-800' :
              product.onStockStatus === 'expected' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
            }`}>
              {product.onStockStatus === 'available' ? 'В наличии' :
               product.onStockStatus === 'expected' ? 'Ожидается' : 'Нет на складе'}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// 3. ОСНОВНАЯ СТРАНИЦА (Server Component)
export default async function ProductsPage() {
  return (
    <main className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Каталог товаров</h1>
      
      {/* Suspense перехватывает загрузку внутри ProductsList и показывает ProductsSkeleton */}
      <Suspense fallback={<ProductsSkeleton />}>
        <ProductsList />
      </Suspense>
    </main>
  );
}

