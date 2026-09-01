'use client';

import { useRouter } from 'next/navigation';

export default function ModalCancelButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="rounded-md border px-4 py-2 text-sm hover:bg-gray-100"
    >
      Отмена
    </button>
  );
}
