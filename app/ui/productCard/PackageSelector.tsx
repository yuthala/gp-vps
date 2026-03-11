// components/PackageSelectorWithUrl.tsx (Client Component)
'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { ProductCard } from '@/app/lib/definitions';
import { useState } from 'react';

export default function PackageSelectorWithUrl({ packaging }: { packaging: ProductCard }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedPackage = searchParams.get('package') ? parseInt(searchParams.get('package')!) : 0;

  const handleSelect = (index: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('package', index.toString());
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex flex-row gap-3 py-8">
      {packaging.packageSize
        .filter(packageSize => packageSize > 0)
        .map((packageSize, index) => {
          const isSelected = selectedPackage === index;
          
          return (
            <button
              key={index}
              onClick={() => handleSelect(index)}
              className={`
                w-32 h-10 flex flex-wrap justify-center items-center 
                rounded-sm text-lg border font-extrabold transition-all duration-200
                ${isSelected 
                  ? 'bg-[#064929] text-white border-[#064929]' 
                  : 'bg-[#F2F9ED] text-[#064929] border-[#064929]/50 hover:border-[#064929]/90 hover:border-2'
                }
              `}
            >
              <span>{(packageSize * packaging.measureUnit)} г</span>
            </button>
          );
        })}
    </div>
  );
}