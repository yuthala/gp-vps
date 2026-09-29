// EditLogisticsSection.tsx
import React from 'react';

interface EditLogisticsSectionProps {
  dx: string;
  dy: string;
  dz: string;
  weight: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function EditLogisticsSection({ dx, dy, dz, weight, onChange }: EditLogisticsSectionProps) {
  return (
    <div className="border-t border-gray-100 pt-6">
      <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700 mb-4">
        Габариты упаковки (Яндекс.Доставка)
      </h3>
      <p className="text-xs text-gray-400 mb-4">
        ⚠️ Количество элементов в полях ниже должно совпадать с количеством элементов в поле «Размеры упаковок». Порядок строго важен.
      </p>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Длина DX (через запятую, см)</label>
          <input type="text" name="dx" value={dx} onChange={onChange} placeholder="15, 20, 25"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Ширина DY (через запятую, см)</label>
          <input type="text" name="dy" value={dy} onChange={onChange} placeholder="15, 20, 25"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Высота DZ (через запятую, см)</label>
          <input type="text" name="dz" value={dz} onChange={onChange} placeholder="10, 15, 20"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Вес Брутто (через запятую, грамм)</label>
          <input type="text" name="weight" value={weight} onChange={onChange} placeholder="350, 600, 1100"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
        </div>
      </div>
    </div>
  );
}
