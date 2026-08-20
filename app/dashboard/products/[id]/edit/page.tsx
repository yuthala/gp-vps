import { notFound } from 'next/navigation';
import { fetchProductByInternalId } from '@/app/lib/dbActions/productsDBactions'; // Корректный путь к вашему файлу функций
import EditProductForm from '@/app/dashboard/products/[id]/edit/edit-form';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params;
  
  // Получаем данные товара напрямую из БД на сервере
  const product = await fetchProductByInternalId(id);

  if (!product) {
    notFound(); // Откроет стандартную 404 страницу Next.js
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Хлебные крошки / Навигация */}
        <nav className="mb-6 text-sm text-gray-500">
          <span className="hover:text-gray-900">Админ-панель</span> {' > '}
          <span className="hover:text-gray-900">Товары</span> {' > '}
          <span className="text-gray-900 font-medium">Редактирование {product.id}</span>
        </nav>

        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight text-gray-900">
            Редактировать товар
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Измените необходимые поля. Системный артикул (SKU) пересчитается автоматически при изменении ключевых свойств.
          </p>
        </div>

        {/* Передаем данные в клиентскую форму */}
        <EditProductForm product={product} />
      </div>
    </div>
  );
}
