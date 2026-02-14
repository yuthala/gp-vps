"use client";

import { useState, useEffect } from 'react';
import GreenPatoLogo from '@/app/ui/gp-logo';
import { PhoneIcon } from '@heroicons/react/24/outline';
import TopHeaderLinks from '@/app/ui/header/header-top-liks';
import MobileMenu from '@/app/ui/header/mobile-menu';
import { usePathname } from 'next/navigation';
import BottomHeaderLinks from '@/app/ui/header/header-bottom-links';
import Search from '@/app/ui/search';
import Link from 'next/link';

export default function Header() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
      // close mobile menu on route change
      setMobileOpen(false);
    }, [pathname]);

    return (
  <header className="fixed top-0 left-0 w-full font-bold">
      <div className="flex w-full justify-center items-center bg-(--secondary) py-4 px-2 h-10 text-white">
        <div className="relative flex max-w-7xl w-full justify-between gap-1">
          <div className="flex items-center gap-1">
            <PhoneIcon className="h-4 w-4 rotate-15" />
            <span className="shrink-0">+7 (977) 818-95-85</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden lg:flex">
              <TopHeaderLinks />
            </div>

            <button
              type="button"
              aria-label="Toggle menu"
              onClick={() => setMobileOpen((s) => !s)}
              className="lg:hidden p-2"
            >
              {mobileOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)}>
            <TopHeaderLinks mobile onLinkClick={() => setMobileOpen(false)} />
          </MobileMenu>
        </div>
      </div>

      <div className="flex justify-center items-center gap-4 bg-(--light-main) h-20 shadow-lg">
          <div className="w-full max-w-7xl px-2 flex flex-wrap items-center justify-between">
            <div className="flex items-center justify-between gap-4 w-full">
             <GreenPatoLogo />

							{/* desktop */}
						 <div className="hidden lg:flex lg:gap-4 w-1/2">
						    <Link href="/catalog" className="bg-(--accent) flex justify-center items-center rounded-sm text-foreground w-34 h-12">Каталог</Link>
								<Search placeholder="Поиск товаров..." />
						 </div>
             <BottomHeaderLinks />
            </div>
          </div>

      </div>
			{/* mobile */}
			<div className="flex flex-col gap-4 lg:hidden w-full bg-(--light-main) px-4 pb-4 shadow-lg">        
				<Search placeholder="Поиск товаров..." />
				<Link href="/catalog" className="bg-(--accent) flex justify-center items-center rounded-sm text-foreground w-full h-12">Каталог</Link>
			</div>
</header>
    );
}