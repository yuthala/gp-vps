"use client"; // Компонент интерактивен, выполняется на клиенте

import React, { useState } from 'react';
import { addNewProduct, type NewProductInput } from '@/app/lib/dbActions/productsDBactions'; // Корректный импорт серверного действия

interface FormState {
  cropSort: string;
  cropName: string;
  tagsString: string;
  packageSizeString: string;
  cropSize: string;
  pathName: string;
  onStockStatus: 'in_stock' | 'out_of_stock' | 'pre_order';
  price: string;
  measureUnit: string;
  estimatedOnStockDate: string;
  description: string;
  descriptionDetails: string;
}

export default function AddProductPage() {
  const [formData, setFormData] = useState<FormState>({
    cropSort: 'Любаша',
    cropName: 'lyubasha',
    tagsString: '#чеснок, #зубок, #Любаша',
    packageSizeString: '2.5, 0, 10',
    cropSize: 'мелкая',
    pathName: 'zubok',
    onStockStatus: 'pre_order',
    price: '100',
    measureUnit: '100',
    estimatedOnStockDate: '2026-08-10',
    description: 'Описание Любаша зубок',
    descriptionDetails: 'Высокоурожайный сорт озимого чеснока...',
  });

  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isPending, setIsPending] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setStatusMessage('Сервер обрабатывает запрос...');

    // Подготовка валидных типов данных для отправки на сервер
    const payload: NewProductInput = {
      cropSort: formData.cropSort,
      cropName: formData.cropName,
      tags: formData.tagsString.split(',').map((t) => t.trim()).filter(Boolean),
      packageSize: formData.packageSizeString.split(',').map((s) => parseFloat(s.trim()) || 0),
      cropSize: formData.cropSize,
      pathName: formData.pathName,
      onStockStatus: formData.onStockStatus,
      price: parseFloat(formData.price) || 0,
      measureUnit: parseInt(formData.measureUnit, 10) || 1,
      estimatedOnStockDate: formData.estimatedOnStockDate,
      description: formData.description,
      descriptionDetails: formData.descriptionDetails,
      imageSrc: ['/products/lyubasha_zubok.webp'], // Временный мок-путь
    };

    // 🔥 Прямой вызов серверной функции вместо fetch API!
    const result = await addNewProduct(payload);

    setIsPending(false);
    if (result.success) {
      setStatusMessage(`🎉 Успех! SKU товара: ${result.sku}`);
    } else {
      setStatusMessage(`❌ Ошибка базы данных: ${result.error}`);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '20px auto', fontFamily: 'sans-serif', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Добавление товара (Server Actions)</h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <label>Сорт (RU): <input type="text" name="cropSort" value={formData.cropSort} onChange={handleChange} required /></label>
        <label>Название (ENG): <input type="text" name="cropName" value={formData.cropName} onChange={handleChange} required /></label>
        <label>Теги: <input type="text" name="tagsString" value={formData.tagsString} onChange={handleChange} /></label>
        <label>Размеры упаковки: <input type="text" name="packageSizeString" value={formData.packageSizeString} onChange={handleChange} /></label>
        <label>Фракция / Размер: <input type="text" name="cropSize" value={formData.cropSize} onChange={handleChange} /></label>
        <label>Путь для URL (ENG): <input type="text" name="pathName" value={formData.pathName} onChange={handleChange} required /></label>
        
        <label>Статус: 
          <select name="onStockStatus" value={formData.onStockStatus} onChange={handleChange}>
            <option value="in_stock">В наличии</option>
            <option value="out_of_stock">Нет на складе</option>
            <option value="pre_order">Предзаказ</option>
          </select>
        </label>

        <label>Цена: <input type="number" name="price" value={formData.price} onChange={handleChange} required /></label>
        <label>Ед. измерения (ID): <input type="number" name="measureUnit" value={formData.measureUnit} onChange={handleChange} required /></label>
        <label>Дата поступления: <input type="date" name="estimatedOnStockDate" value={formData.estimatedOnStockDate} onChange={handleChange} /></label>
        <label>Краткое описание: <textarea name="description" value={formData.description} onChange={handleChange} required /></label>
        <label>Детальное описание: <textarea name="descriptionDetails" value={formData.descriptionDetails} onChange={handleChange} /></label>

        <button type="submit" disabled={isPending} style={{ padding: '10px', background: isPending ? '#ccc' : '#0070f3', color: '#fff', border: 'none', borderRadius: '4px', cursor: isPending ? 'not-allowed' : 'pointer' }}>
          {isPending ? 'Секунду...' : 'Создать товар'}
        </button>
      </form>

      {statusMessage && <p style={{ marginTop: '15px', fontWeight: 'bold', textAlign: 'center' }}>{statusMessage}</p>}
    </div>
  );
}
