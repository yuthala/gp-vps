// LogisticsSection.tsx
import React from 'react';

interface LogisticsSectionProps {
  dx: string;
  dy: string;
  dz: string;
  weight: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function LogisticsSection({ dx, dy, dz, weight, onChange }: LogisticsSectionProps) {
  return (
    <div className="border-t border-gray-100 pt-6">
      <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700 mb-4">
        Габариты упаковки (Яндекс.Доставка)
      </h3>
      <p className="text-xs text-gray-400 mb-4">
        ⚠️ Количество элементов в полях ниже должно совпадать с количеством элементов в поле «Размеры упаковок».
      </p>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Длина DX (см)</label>
          <input type="text" name="dx" value={dx} onChange={onChange} placeholder="15, 20, 25"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none" />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Ширина DY (см)</label>
          <input type="text" name="dy" value={dy} onChange={onChange} placeholder="15, 20, 25"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none" />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Высота DZ (см)</label>
          <input type="text" name="dz" value={dz} onChange={onChange} placeholder="10, 15, 20"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none" />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Вес Брутто (грамм)</label>
          <input type="text" name="weight" value={weight} onChange={onChange} placeholder="350, 600, 1100"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none" />
        </div>
      </div>
    </div>
  );
}
