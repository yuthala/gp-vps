import React from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function TextFields({ data, onChange }: { data: any; onChange: any }) {
  return (
    <div className="border-t border-gray-100 pt-6 space-y-6">
      <div>
        <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Ожидаемая дата поступления</label>
        <input type="date" name="estimatedOnStockDate" value={data.estimatedOnStockDate} onChange={onChange}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none" />
      </div>
      <div>
        <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Краткое описание товара</label>
        <textarea name="description" value={data.description} onChange={onChange} rows={3} required
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none" />
      </div>
      <div>
        <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Детальное описание</label>
        <textarea name="descriptionDetails" value={data.descriptionDetails} onChange={onChange} rows={4}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none" />
      </div>
    </div>
  );
}
