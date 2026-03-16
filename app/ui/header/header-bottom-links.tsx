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
				const isActive = pathname === link.href;
				
				return (
					<a
						key={link.name}
						href={link.href}
						className={clsx(
							'group flex flex-col items-center gap-0 text-normal font-bold transition-all duration-200 hover:scale-110',
							{
								'bg-transparent': isActive,
								'text-(--secondary)': !isActive,
								'text-foreground': isActive,
							},
						)}
					>
						<LinkIcon 
							className={clsx(
								'w-8 transition-colors duration-200',
								{
									'text-(--secondary)': !isActive,
									'text-foreground': isActive,
								}
							)} 
						/>
						<p className="hidden md:block">{link.name}</p>
					</a>
				);
			})}
		</>
	);
}