'use client'

import { PhoneIcon } from '@heroicons/react/24/outline';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

// Map of links to display in the header navigation.
// Depending on the size of the application, this would be stored in a database.

const links = [
    {name: 'Главная' , href:'/',icon: PhoneIcon},
    {name: 'Каталог' , href:'/catalog',icon: PhoneIcon},
    {name: 'Культуры' , href:'/crops', icon: PhoneIcon},
    {name: 'Доставка и оплата' , href:'/delivery', icon: PhoneIcon},
    {name: 'О магазине' , href:'/about-shop', icon: PhoneIcon},
    {name: 'Контакты' , href:'/contacts', icon: PhoneIcon},
]

export default function TopHeaderLinks() {
     const pathname = usePathname();
    return (
        <>
        {links.map((link) => {
            const LinkIcon = link.icon;
            return (
                <a
                 key={link.name}
                 href={link.href}
                  className={clsx(
                            'flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-yellow-500 p-3 text-sm font-medium hover:bg-yellow-500  md:flex-none md:justify-start md:p-2 md:px-3',
                            {
                                'bg-yellow-300/80': pathname === link.href,
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