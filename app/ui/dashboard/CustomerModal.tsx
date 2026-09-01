'use client';

import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function CustomerModal({ children }: { children: ReactNode }) {
  const router = useRouter();
  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/50 p-4" onClick={() => router.back()}>
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <button type="button" onClick={() => router.back()} aria-label="Закрыть" title="Закрыть" className="absolute right-4 top-4 rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900">
          <XMarkIcon className="h-5 w-5" />
        </button>
        {children}
      </div>
    </div>
  );
}
