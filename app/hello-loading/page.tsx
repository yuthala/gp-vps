import { Suspense } from 'react';
import ProductsLoading from './loading'; // Импортируем ваш новый красивый файл загрузки
import { fetchAllProducts } from '@/app/lib/dbActions/productsDBactions';
import { ProductCard } from '@/app/lib/definitions';

// 1. КОМПОНЕНТ ДЛЯ ОТОБРАЖЕНИЯ (Синхронный)
async function ProductsList() {
    // Внутри функции ProductsPage или ProductsList перед запросом к БД:
await new Promise((resolve) => setTimeout(resolve, 4000)); // задержит загрузку на 4 секунды

const products: ProductCard[] = await fetchAllProducts();
  if (!products || products.length === 0) {
    return <div className="text-center py-10 text-gray-500">Товары не найдены</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <div key={product.id} className="border border-gray-200 rounded-lg p-4 flex flex-col justify-between hover:shadow-lg transition-shadow bg-white">
          <div>
            <div className="aspect-square w-full relative bg-gray-100 rounded-md overflow-hidden mb-4">
              {product.imageSrc && product.imageSrc[0] ? (
                <img src={product.imageSrc[0]} alt={product.cropName} className="object-cover w-full h-full" />
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

// 2. ОСНОВНАЯ СТРАНИЦА (Асинхронная)
export default async function ProductsPage() {
  return (
    <main className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Каталог товаров</h1>
      {/* Передаем компонент загрузки вручную в fallback */}
      <Suspense fallback={<ProductsLoading />}>
        <ProductsList />
      </Suspense>
    </main>
  );
}
