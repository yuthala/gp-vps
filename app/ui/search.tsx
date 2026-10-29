"use client";

import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Search({
  placeholder,
  clearToHome = false,
  action = '/catalog',
}: {
  placeholder: string;
  clearToHome?: boolean;
  action?: string;
}) {
  const [query, setQuery] = useState('');
  const router = useRouter();

  function clearSearch() {
    setQuery('');
    if (clearToHome) {
      router.push('/');
    }
  }

  return (
    <form action={action} method="get" className="relative flex items-center justify-center w-full">
      <input
        type="text"
        name="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        className="peer w-full rounded-md border border-gray-400 text-sm placeholder:text-gray-400 h-12 pl-10 pr-12 xl:pr-36"
        placeholder={placeholder}
      />
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
      {query && (
        <button
          type="button"
          aria-label="Очистить поиск"
          onClick={clearSearch}
          className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center text-gray-500 hover:text-gray-900 xl:right-28"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      )}
      <button
        type="submit"
        className="absolute right-0 top-1/2 -translate-y-1/2 hidden xl:flex shrink-0 items-center justify-center bg-(--accent) text-foreground w-26 py-4 px-6 h-12 
				 rounded-[0_6px_6px_0] border-x border-t border-b border-gray-400 
				 transition-all duration-200 hover:opacity-90 hover:shadow-md active:opacity-100"
      >
        Найти
      </button>
    </form>
  );
}