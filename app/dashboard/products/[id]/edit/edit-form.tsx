'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateProduct } from '@/app/lib/dbActions/productsDBactions'; // Путь к вашему файлу функций
import Link from 'next/link';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function EditProductForm({ product }: { product: any }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Инициализируем состояние формы текущими данными товара
  const [formData, setFormData] = useState({
    cropSort: product.cropSort,
    cropName: product.cropName,
    price: product.price,
    cropSize: product.cropSize,
    pathName: product.pathName,
    onStockStatus: product.onStockStatus,
    measureUnit: product.measureUnit,
    estimatedOnStockDate: product.estimatedOnStockDate,
    description: product.description,
    descriptionDetails: product.descriptionDetails,
    // Массивы и строки для простоты ввода переводим в текстовый формат (через запятую)
    tags: product.tags.join(', '),
    packageSize: product.packageSize.join(', '),
    imageSrc: product.imageSrc.join(', '),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    // Преобразуем текстовые поля ввода обратно в массивы, как требует БД
    const formattedData = {
      internalId: product.internal_id,
      cropSort: formData.cropSort,
      cropName: formData.cropName,
      price: Number(formData.price),
      cropSize: formData.cropSize,
      pathName: formData.pathName,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onStockStatus: formData.onStockStatus as any,
      measureUnit: Number(formData.measureUnit),
      estimatedOnStockDate: formData.estimatedOnStockDate,
      description: formData.description,
      descriptionDetails: formData.descriptionDetails,
      tags: formData.tags.split(',').map((t: string) => t.trim()).filter(Boolean),
      packageSize: formData.packageSize.split(',').map((v: string) => Number(v.trim())).filter((v: number) => !isNaN(v)),
      imageSrc: formData.imageSrc.split(',').map((img: string) => img.trim()).filter(Boolean),
    };

    const result = await updateProduct(formattedData);

    if (result.success) {
      setMessage({ type: 'success', text: `Товар успешно обновлен! Новый SKU: ${result.sku}` });
      // Небольшая задержка перед редиректом, чтобы админ успел увидеть сообщение об успехе
      setTimeout(() => {
        router.push('/dashboard/product-cards');
        router.refresh();
      }, 1500);
    } else {
      setMessage({ type: 'error', text: result.error || 'Произошла ошибка при сохранении' });
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 rounded-3xl bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100/80">
      
      {/* Вывод системных сообщений */}
      {message && (
        <div className={`p-4 rounded-2xl border text-sm font-medium ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Секция 1: Основные характеристики */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Название культуры (Eng)</label>
          <input type="text" name="cropName" value={formData.cropName} onChange={handleChange} required
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Сорт культуры</label>
          <input type="text" name="cropSort" value={formData.cropSort} onChange={handleChange} required
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Цена (₽)</label>
          <input type="number" name="price" value={formData.price} onChange={handleChange} required step="0.01"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Статус наличия</label>
          <select name="onStockStatus" value={formData.onStockStatus} onChange={handleChange}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white">
            <option value="in_stock">В наличии (In Stock)</option>
            <option value="out_of_stock">Нет на складе (Out of Stock)</option>
            <option value="pre_order">Предзаказ (Pre-order)</option>
          </select>
        </div>
      </div>

      {/* Секция 2: Системные параметры генерации SKU */}
      <div className="border-t border-gray-100 pt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Размер фракции / луковицы</label>
          <input type="text" name="cropSize" value={formData.cropSize} onChange={handleChange} required
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Имя пути (Тип/Фракция для SKU)</label>
          <input type="text" name="pathName" value={formData.pathName} onChange={handleChange} required
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Единица измерения (вес)</label>
          <input type="number" name="measureUnit" value={formData.measureUnit} onChange={handleChange} required
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
        </div>
      </div>

      {/* Секция 3: Сложные массивы (ввод через запятую) */}
      <div className="border-t border-gray-100 pt-6 space-y-6">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Размеры упаковок (через запятую, например: 25, 50, 10)</label>
          <input type="text" name="packageSize" value={formData.packageSize} onChange={handleChange} required
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Теги товара (через запятую, например: Чеснок, Озимый, Крупный)</label>
          <input type="text" name="tags" value={formData.tags} onChange={handleChange}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Ссылки на изображения (URL через запятую)</label>
          <textarea name="imageSrc" value={formData.imageSrc} onChange={handleChange} rows={2} required
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
        </div>
      </div>

      {/* Секция 4: Тексты и даты */}
      <div className="border-t border-gray-100 pt-6 space-y-6">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Ожидаемая дата поступления</label>
          <input type="date" name="estimatedOnStockDate" value={formData.estimatedOnStockDate} onChange={handleChange}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Краткое описание товара</label>
          <textarea name="description" value={formData.description} onChange={handleChange} rows={3} required
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Детальное описание (Инструкции/Характеристики)</label>
          <textarea name="descriptionDetails" value={formData.descriptionDetails} onChange={handleChange} rows={4}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
        </div>
      </div>

           {/* Кнопки управления деятельностью */}
      <div className="border-t border-gray-100 pt-6 flex items-center justify-end gap-4">
        <Link 
          href="/dashboard/product-cards"
          className="rounded-xl bg-gray-50 px-5 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
        >
          Отмена
        </Link>
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="rounded-xl bg-gray-900 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-gray-900/10 hover:bg-gray-800 disabled:bg-gray-400 active:scale-[0.98] transition-all duration-200"
        >
          {isSubmitting ? 'Сохранение...' : 'Сохранить изменения'}
        </button>
      </div>

    </form>
  );
}
