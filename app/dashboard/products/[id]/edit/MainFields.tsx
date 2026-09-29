import React from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function MainFields({ data, onChange }: { data: any; onChange: any }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <div>
        <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Название культуры (Eng)</label>
        <input type="text" name="cropName" value={data.cropName} onChange={onChange} required
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none" />
      </div>
      <div>
        <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Сорт культуры</label>
        <input type="text" name="cropSort" value={data.cropSort} onChange={onChange} required
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none" />
      </div>
      <div>
        <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Цена (₽)</label>
        <input type="number" name="price" value={data.price} onChange={onChange} required step="0.01"
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none" />
      </div>
      <div>
        <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Статус наличия</label>
        <select name="onStockStatus" value={data.onStockStatus} onChange={onChange}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none bg-white">
          <option value="available">В наличии (Available)</option>
          <option value="not_available">Нет на складе (Not available)</option>
          <option value="expected">Предзаказ (Expected)</option>
        </select>
      </div>
    </div>
  );
}
