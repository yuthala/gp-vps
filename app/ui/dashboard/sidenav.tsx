'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import NavLinks from '@/app/ui/dashboard/nav-links';
//import GPLogo from '@/app/ui/gp-logo';
import { PowerIcon } from '@heroicons/react/24/outline';

export default function SideNav() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/session', { method: 'DELETE' });
      if (res.ok) {
        router.push('/');
      } else {
        console.error('Sign out failed');
      }
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col px-3 py-4 md:px-2">
      {/* <Link
        className="mb-2 flex h-20 items-end justify-start rounded-md bg-blue-600 p-4 md:h-40"
        href="/"
      >
        <div className="w-32 text-white md:w-40">
          <GPLogo />
        </div>
      </Link> */}
      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
        <NavLinks />
        <div className="hidden h-auto w-full grow rounded-md bg-gray-50 md:block"></div>
        <form onSubmit={handleSignOut}>
          <button
            type="submit"
            disabled={isLoading}
            className="flex h-[48px] w-full grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 disabled:opacity-50 md:flex-none md:justify-start md:p-2 md:px-3"
          >
            <PowerIcon className="w-6" />
            <div className="hidden md:block">Sign Out</div>
          </button>
        </form>
      </div>
    </div>
  );
}
