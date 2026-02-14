'use client'

import { UserCircleIcon, ShoppingCartIcon} from '@heroicons/react/24/outline';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

const links = [
    {name: 'Найти' , href:'/search-page',icon: MagnifyingGlassIcon},
    {name: 'Корзина' , href:'/shopping-cart',icon: ShoppingCartIcon},
    {name: 'Вход' , href:'/user-account',icon: UserCircleIcon}
]

export default function BottomHeaderLinks() {

    const pathname = usePathname()

    return (
        <>
        {links.map((link) => {
            const LinkIcon = link.icon;
            return (
                <a
                 key={link.name}
                 href={link.href}
                 className={clsx ('flex items-center gap-5 self-start rounded-lg bg-lime-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-lime-400/80 md:text-base',
                    {
                        'bg-lime-400/80' : pathname === link.href
                    },
            )}
                    >
                    <LinkIcon className="w-6" />
                    <p className="hidden md:block">{link.name}</p>
                 </a>
            );
        })}
        </>
    );
}