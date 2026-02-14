'use client'

import { UserCircleIcon, ShoppingCartIcon} from '@heroicons/react/24/outline';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

const links = [
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
							className={clsx ('flex flex-col items-center gap-0 text-normal font-bold text-(--secondary)',
									{
											'bg-(--light-green)' : pathname === link.href
									},
					)}
									>
									<LinkIcon className="w-8 text-(--secondary)" />
									<p className="hidden md:block">{link.name}</p>
							</a>
            );
        })}
        </>
    );
}