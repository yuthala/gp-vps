// "use client";

// import React, { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { addNewProduct, type NewProductInput } from '@/app/lib/dbActions/productsDBactions';
// import Link from 'next/link';

// // Импортируем вынесенные части
// import { initialProductState } from '@/app/dashboard/add-product/initialData';
// import LogisticsSection from '@/app/dashboard/add-product/LogisticsSection';

// export default function AddProductPage() {
//   const router = useRouter();
//   const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
//   const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
//   // Состояние инициализируется данными из отдельного файла
//   const [formData, setFormData] = useState(initialProductState);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (isSubmitting) return;
//     setIsSubmitting(true);
//     setMessage(null);

//     const parseNumericArray = (str: string) => 
//       str.split(',').map((v: string) => Number(v.trim())).filter((v: number) => !isNaN(v));

//     const payload: NewProductInput = {
//       internalId: '',
//       cropSort: formData.cropSort,
//       cropName: formData.cropName,
//       price: parseFloat(formData.price) || 0,
//       cropSize: formData.cropSize,
//       pathName: formData.pathName,
//       onStockStatus: formData.onStockStatus,
//       measureUnit: parseInt(formData.measureUnit, 10) || 1,
//       estimatedOnStockDate: formData.estimatedOnStockDate,
//       description: formData.description,
//       descriptionDetails: formData.descriptionDetails,
//       tags: formData.tags.split(',').map((t: string) => t.trim()).filter(Boolean),
//       packageSize: parseNumericArray(formData.packageSize),
//       imageSrc: formData.imageSrc.split(',').map((img: string) => img.trim()).filter(Boolean),
//       dx: parseNumericArray(formData.dx),
//       dy: parseNumericArray(formData.dy),
//       dz: parseNumericArray(formData.dz),
//       weight: parseNumericArray(formData.weight),
//     };

//     const result = await addNewProduct(payload);

//     if (result.success) {
//       setMessage({ type: 'success', text: `🎉 Успех! Товар добавлен. SKU: ${result.sku}` });
//       setTimeout(() => {
//         router.push('/dashboard/product-cards');
//         router.refresh();
//       }, 1500);
//     } else {
//       setMessage({ type: 'error', text: `❌ Ошибка: ${result.error || 'Не удалось сохранить'}` });
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-8 rounded-3xl bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100/80 max-w-4xl mx-auto my-6">
//       <div className="border-b border-gray-100 pb-4">
//         <h2 className="text-xl font-bold text-gray-900">Добавление нового товара</h2>
//       </div>

//       {message && (
//         <div className={`p-4 rounded-2xl border text-sm font-medium ${
//           message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
//         }`}>{message.text}</div>
//       )}

//       {/* Характеристики культуры */}
//       <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
//         <div>
//           <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Название культуры (Eng)</label>
//           <input type="text" name="cropName" value={formData.cropName} onChange={handleChange} required
//             className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500" />
//         </div>
//         <div>
//           <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Сорт культуры</label>
//           <input type="text" name="cropSort" value={formData.cropSort} onChange={handleChange} required
//             className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500" />
//         </div>
//         <div>
//           <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Цена (₽)</label>
//           <input type="number" name="price" value={formData.price} onChange={handleChange} required step="0.01"
//             className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500" />
//         </div>
//         <div>
//           <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Статус наличия</label>
//           <select name="onStockStatus" value={formData.onStockStatus} onChange={handleChange}
//             className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 bg-white">
//             <option value="available">В наличии</option>
//             <option value="not_available">Нет на складе</option>
//             <option value="expected">Предзаказ</option>
//           </select>
//         </div>
//       </div>

//       {/* Параметры SKU */}
//       <div className="border-t border-gray-100 pt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
//         <div>
//           <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Размер фракции</label>
//           <input type="text" name="cropSize" value={formData.cropSize} onChange={handleChange} required
//             className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500" />
//         </div>
//         <div>
//           <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Имя пути для URL</label>
//           <input type="text" name="pathName" value={formData.pathName} onChange={handleChange} required
//             className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500" />
//         </div>
//         <div>
//           <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Единица измерения</label>
//           <input type="number" name="measureUnit" value={formData.measureUnit} onChange={handleChange} required
//             className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500" />
//         </div>
//       </div>

//       {/* Массивы упаковок, тегов и картинок */}
//       <div className="border-t border-gray-100 pt-6 space-y-6">
//         <div>
//           <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Размеры упаковок (через запятую)</label>
//           <input type="text" name="packageSize" value={formData.packageSize} onChange={handleChange} required
//             className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500" />
//         </div>
//         <div>
//           <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Теги товара</label>
//           <input type="text" name="tags" value={formData.tags} onChange={handleChange}
//             className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500" />
//         </div>
//         <div>
//           <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Ссылки на изображения (через запятую)</label>
//           <textarea name="imageSrc" value={formData.imageSrc} onChange={handleChange} rows={2} required
//             className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500" />
//         </div>
//       </div>

//       {/* Подключаем нашу вынесенную секцию логистики Яндекс Доставки */}
//       <LogisticsSection 
//         dx={formData.dx}
//         dy={formData.dy}
//         dz={formData.dz}
//         weight={formData.weight}
//         onChange={handleChange}
//       />

//       {/* Описания и даты */}
//       <div className="border-t border-gray-100 pt-6 space-y-6">
//         <div>
//           <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Ожидаемая дата поступления</label>
//           <input type="date" name="estimatedOnStockDate" value={formData.estimatedOnStockDate} onChange={handleChange}
//             className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500" />
//         </div>
//         <div>
//           <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Краткое описание товара</label>
//           <textarea name="description" value={formData.description} onChange={handleChange} rows={3} required
//             className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500" />
//         </div>
//         <div>
//           <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Детальное описание</label>
//           <textarea name="descriptionDetails" value={formData.descriptionDetails} onChange={handleChange} rows={4}
//             className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500" />
//         </div>
//       </div>

//       {/* Кнопки */}
//       <div className="border-t border-gray-100 pt-6 flex items-center justify-end gap-4">
//         <Link href="/dashboard/product-cards" className="rounded-xl bg-gray-50 px-5 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-100">
//           Отмена
//         </Link>
//         <button type="submit" disabled={isSubmitting} className="rounded-xl bg-gray-900 px-6 py-3 text-sm font-bold text-white shadow-lg disabled:bg-gray-400">
//           {isSubmitting ? 'Секунду...' : 'Создать товар'}
//         </button>
//       </div>
//     </form>
//   );
// }

"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addNewProduct, type NewProductInput } from '@/app/lib/dbActions/productsDBactions';
import Link from 'next/link';

// Импортируем вынесенные части
import { initialProductState } from '@/app/dashboard/add-product/initialData';
import LogisticsSection from '@/app/dashboard/add-product/LogisticsSection';

export default function AddProductPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Состояние инициализируется данными из отдельного файла
  const [formData, setFormData] = useState(initialProductState);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setMessage(null);

    const parseNumericArray = (str: string) => 
      str.split(',').map((v: string) => Number(v.trim())).filter((v: number) => !isNaN(v));

    const payload: NewProductInput = {
      internalId: '',
      cropSort: formData.cropSort,
      cropName: formData.cropName,
      price: parseFloat(formData.price) || 0,
      cropSize: formData.cropSize,
      pathName: formData.pathName,
      onStockStatus: formData.onStockStatus,
      measureUnit: parseInt(formData.measureUnit, 10) || 1,
      estimatedOnStockDate: formData.estimatedOnStockDate,
      description: formData.description,
      descriptionDetails: formData.descriptionDetails,
      tags: formData.tags.split(',').map((t: string) => t.trim()).filter(Boolean),
      packageSize: parseNumericArray(formData.packageSize),
      imageSrc: formData.imageSrc.split(',').map((img: string) => img.trim()).filter(Boolean),
      dx: parseNumericArray(formData.dx),
      dy: parseNumericArray(formData.dy),
      dz: parseNumericArray(formData.dz),
      weight: parseNumericArray(formData.weight),
    };

    const result = await addNewProduct(payload);

    if (result.success && result.sku) {
      // ИЗМЕНЕНИЕ ЛОГИКИ: осуществляем переход на перехватываемый роут успеха
      // Next.js перехватит эту ссылку и плавно покажет модалку без перезагрузки интерфейса
      router.push(`/dashboard/add-product/success/${result.sku}`);
      
      // Сбрасываем форму в дефолтное состояние для возможности добавления новой позиции
      setFormData(initialProductState);
      setIsSubmitting(false);
    } else {
      setMessage({ type: 'error', text: `❌ Ошибка: ${result.error || 'Не удалось сохранить'}` });
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 rounded-3xl bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100/80 max-w-4xl mx-auto my-6">
      <div className="border-b border-gray-100 pb-4">
        <h2 className="text-xl font-bold text-gray-900">Добавление нового товара</h2>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl border text-sm font-medium ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>{message.text}</div>
      )}

      {/* Характеристики культуры */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Название культуры (Eng)</label>
          <input type="text" name="cropName" value={formData.cropName} onChange={handleChange} required
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Сорт культуры</label>
          <input type="text" name="cropSort" value={formData.cropSort} onChange={handleChange} required
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Цена (₽)</label>
          <input type="number" name="price" value={formData.price} onChange={handleChange} required step="0.01"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Статус наличия</label>
          <select name="onStockStatus" value={formData.onStockStatus} onChange={handleChange}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 bg-white">
            <option value="available">В наличии</option>
            <option value="not_available">Нет на складе</option>
            <option value="expected">Предзаказ</option>
          </select>
        </div>
      </div>

      {/* Параметры SKU */}
      <div className="border-t border-gray-100 pt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div>
          <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Размер фракции</label>
          <input type="text" name="cropSize" value={formData.cropSize} onChange={handleChange} required
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Имя пути для URL</label>
          <input type="text" name="pathName" value={formData.pathName} onChange={handleChange} required
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Единица измерения</label>
          <input type="number" name="measureUnit" value={formData.measureUnit} onChange={handleChange} required
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500" />
        </div>
      </div>

      {/* Массивы упаковок, тегов и картинок */}
      <div className="border-t border-gray-100 pt-6 space-y-6">
        <div>
          <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Размеры упаковок (через запятую)</label>
          <input type="text" name="packageSize" value={formData.packageSize} onChange={handleChange} required
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Теги товара</label>
          <input type="text" name="tags" value={formData.tags} onChange={handleChange}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Ссылки на изображения (через запятую)</label>
          <textarea name="imageSrc" value={formData.imageSrc} onChange={handleChange} rows={2} required
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500" />
        </div>
      </div>

      {/* Подключаем нашу вынесенную секцию логистики Яндекс Доставки */}
      <LogisticsSection 
        dx={formData.dx}
        dy={formData.dy}
        dz={formData.dz}
        weight={formData.weight}
        onChange={handleChange}
      />

      {/* Описания и даты */}
      <div className="border-t border-gray-100 pt-6 space-y-6">
        <div>
          <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Ожидаемая дата поступления</label>
          <input type="date" name="estimatedOnStockDate" value={formData.estimatedOnStockDate} onChange={handleChange}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Краткое описание товара</label>
          <textarea name="description" value={formData.description} onChange={handleChange} rows={3} required
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Детальное описание</label>
          <textarea name="descriptionDetails" value={formData.descriptionDetails} onChange={handleChange} rows={4}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500" />
        </div>
      </div>

      {/* Кнопки действий */}
      <div className="border-t border-gray-100 pt-6 flex items-center justify-end gap-4">
        <Link href="/dashboard/product-cards" className="rounded-xl bg-gray-50 px-5 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors">
          Отмена
        </Link>
        <button type="submit" disabled={isSubmitting} className="rounded-xl bg-[#14a34a] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/10 hover:bg-[#118c3f] disabled:bg-emerald-200/50 disabled:text-emerald-400/80 disabled:cursor-not-allowed active:scale-[0.98] transition-all duration-200">
          {isSubmitting ? 'Секунду...' : 'Создать товар'}
        </button>
      </div>
    </form>
  );
}
