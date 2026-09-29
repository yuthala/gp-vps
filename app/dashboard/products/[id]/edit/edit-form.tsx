'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateProduct } from '@/app/lib/dbActions/productsDBactions'; 
import Link from 'next/link';

// Импортируем все наши компактные секции
import { ProductData } from './types';
import MainFields from '@/app/dashboard/products/[id]/edit/MainFields';
import SkuFields from '@/app/dashboard/products/[id]/edit/SKUFields';
import ArrayFields from '@/app/dashboard/products/[id]/edit/ArrayFields';
import EditLogisticsSection from '@/app/dashboard/products/[id]/edit/EditLogisticsSection';
import TextFields from './TextFields';

export default function EditProductForm({ product }: { product: ProductData }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState({
    cropSort: product.cropSort || '',
    cropName: product.cropName || '',
    price: product.price || 0,
    cropSize: product.cropSize || '',
    pathName: product.pathName || '',
    onStockStatus: product.onStockStatus || 'not_available',
    measureUnit: product.measureUnit || 1,
    estimatedOnStockDate: product.estimatedOnStockDate || '',
    description: product.description || '',
    descriptionDetails: product.descriptionDetails || '',
    tags: (product.tags || []).join(', '),
    packageSize: (product.packageSize || []).join(', '),
    imageSrc: (product.imageSrc || []).join(', '),
    dx: (product.dx || []).join(', '),
    dy: (product.dy || []).join(', '),
    dz: (product.dz || []).join(', '),
    weight: (product.weight || []).join(', '),
  });

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
      packageSize: parseNumericArray(formData.packageSize),
      imageSrc: formData.imageSrc.split(',').map((img: string) => img.trim()).filter(Boolean),
      dx: parseNumericArray(formData.dx),
      dy: parseNumericArray(formData.dy),
      dz: parseNumericArray(formData.dz),
      weight: parseNumericArray(formData.weight),
    };

    const result = await updateProduct(formattedData);

    if (result.success && result.sku) {
      router.push(`/dashboard/products/${product.internal_id}/edit/success/${result.sku}`);
      setIsSubmitting(false);
    } else {
      setMessage({ type: 'error', text: result.error || 'Произошла ошибка при сохранении' });
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 rounded-3xl bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100/80">
      {message && (
        <div className={`p-4 rounded-2xl border text-sm font-medium ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>{message.text}</div>
      )}

      <MainFields data={formData} onChange={handleChange} />
      <SkuFields data={formData} onChange={handleChange} />
      <ArrayFields data={formData} onChange={handleChange} />
      
      <EditLogisticsSection 
        dx={formData.dx} dy={formData.dy} dz={formData.dz} weight={formData.weight} 
        onChange={handleChange} 
      />
      
      <TextFields data={formData} onChange={handleChange} />

      <div className="border-t border-gray-100 pt-6 flex items-center justify-end gap-4">
        <Link href="/dashboard/product-cards" className="rounded-xl bg-gray-50 px-5 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors">
          Отмена
        </Link>
        <button type="submit" disabled={isSubmitting}
          className="rounded-xl bg-[#14a34a] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/10 hover:bg-[#118c3f] disabled:bg-emerald-200/50 disabled:text-emerald-400/80 disabled:cursor-not-allowed active:scale-[0.98] transition-all duration-200"
        >
          {isSubmitting ? 'Сохранение...' : 'Сохранить изменения'}
        </button>
      </div>
    </form>
  );
}
