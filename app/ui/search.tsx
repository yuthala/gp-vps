'use client';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function Search({ placeholder }: { placeholder: string }) {
  return (
    <div className="relative flex items-center justify-center w-1/2">
      <input
        className="peer w-full rounded-md border border-gray-400 text-sm placeholder:text-gray-400 h-12 placeholder:pl-12"
        placeholder={placeholder}
      />
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
			<Link href="/user-account" className="absolute right-0 top-1/2 -translate-y-1/2 flex shrink-0 items-center justify-center bg-(--accent) text-foreground w-26 py-4 px-6 h-12 rounded-[0_6px_6px_0] border-x border-t border-b border-gray-400 ">Найти</Link>
    </div>
  );
}