'use client'

import { PhoneIcon } from '@heroicons/react/24/outline';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

// Map of links to display in the header navigation.
// Depending on the size of the application, this would be stored in a database.

const links = [
    {name: 'Главная' , href:'/'},
    {name: 'Каталог' , href:'/catalog'},
    {name: 'Культуры' , href:'/crops'},
    {name: 'Доставка и оплата' , href:'/delivery'},
    {name: 'Забронировать' , href:'/reserve'},
    {name: 'Контакты' , href:'/contacts'},
]

export default function TopHeaderLinks({ mobile = false, onLinkClick }: { mobile?: boolean; onLinkClick?: () => void }) {
     const pathname = usePathname();
    return (
        <>
        {links.map((link) => {
            return (
                <a
                 key={link.name}
                 href={link.href}
                 onClick={() => onLinkClick?.()}
                  className={clsx(
                            'flex items-center justify-center gap-1 rounded-md font-bold lg:bg-(--secondary) hover:bg-(--light-main) hover:text-(--secondary) transition-colors lg:py-1 md:p-2 md:px-3',
                            {
                                'w-full': mobile,
                                'underline decoration-2 underline-offset-4': pathname === link.href,
                            },
                )}
                 >
                    <p className={mobile ? 'w-full text-center text-2xl' : 'hidden md:block'}>{link.name}</p>
                 </a>
            );
        })}
        </>
    );
}