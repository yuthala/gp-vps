import React from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ArrayFields({ data, onChange }: { data: any; onChange: any }) {
  return (
    <div className="border-t border-gray-100 pt-6 space-y-6">
      <div>
        <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Размеры упаковок</label>
        <input type="text" name="packageSize" value={data.packageSize} onChange={onChange} required
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none" />
      </div>
      <div>
        <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Теги товара</label>
        <input type="text" name="tags" value={data.tags} onChange={onChange}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none" />
      </div>
      <div>
        <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Ссылки на изображения</label>
        <textarea name="imageSrc" value={data.imageSrc} onChange={onChange} rows={2} required
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none" />
      </div>
    </div>
  );
}
