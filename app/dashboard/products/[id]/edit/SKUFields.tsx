import React from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function SkuFields({ data, onChange }: { data: any; onChange: any }) {
  return (
    <div className="border-t border-gray-100 pt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
      <div>
        <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Размер фракции</label>
        <input type="text" name="cropSize" value={data.cropSize} onChange={onChange} required
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none" />
      </div>
      <div>
        <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Имя пути для SKU</label>
        <input type="text" name="pathName" value={data.pathName} onChange={onChange} required
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none" />
      </div>
      <div>
        <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Единица измерения (вес)</label>
        <input type="number" name="measureUnit" value={data.measureUnit} onChange={onChange} required
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none" />
      </div>
    </div>
  );
}
