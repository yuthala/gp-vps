'use client'

import { UserCircleIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import { usePathname, useRouter } from 'next/navigation';
import clsx from 'clsx';
import CartBadge from './cartBadge';
import { useState, useEffect } from 'react';
import { getInitialValueFromCookies } from '@/app/lib/actions';
import Link from 'next/link';

const links = [
    { name: 'Корзина', href: '/shopping-cart', icon: ShoppingCartIcon },
    { name: 'Вход', href: '', icon: UserCircleIcon }
]

export default function BottomHeaderLinks() {
    const pathname = usePathname();
    const router = useRouter();
    const [cartCount, setCartCount] = useState<string>('0');
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

    useEffect(() => {
        const fetchCartCount = async () => {
            const initialCount = await getInitialValueFromCookies();
            setCartCount(initialCount || '0');
        };
        fetchCartCount();
    }, []);

    useEffect(() => {
        const checkSession = async () => {
            try {
                const res = await fetch('/api/session/validate');
                const data = await res.json();
                setIsLoggedIn(data.ok === true);
            } catch (err) {
                console.error('Error checking session:', err);
                setIsLoggedIn(false);
            }
        };
        checkSession();
    }, []);

    const handleLoginClick = (e: React.MouseEvent, link: typeof links[0]) => {
        if (link.name === 'Вход') {
            e.preventDefault();
            const destination = isLoggedIn ? '/dashboard' : '/login-page';
            router.push(destination);
        }
    };

    return (
        <>
            {links.map((link) => {
                const LinkIcon = link.icon;
                const isActive = pathname === link.href;
                const isCart = link.href === '/shopping-cart';
                
                return (
                    <Link
                        key={link.name}
                        href={link.href}
                        onClick={(e) => handleLoginClick(e, link)}
                        className={clsx(
                            'group relative flex flex-col items-center gap-0 text-normal font-bold transition-all duration-200 hover:scale-110',
                            {
                                'bg-transparent': isActive,
                                'text-(--secondary)': !isActive,
                                'text-foreground': isActive,
                            },
                        )}
                    >
                        <div className="relative">
                            <LinkIcon 
                                className={clsx(
                                    'w-8 transition-colors duration-200',
                                    {
                                        'text-(--secondary)': !isActive,
                                        'text-foreground': isActive,
                                    }
                                )} 
                            />
                            {/* Render CartBadge only for shopping cart */}
                            {isCart && (
                                <CartBadge 
                                    initialCount={cartCount} 
                                    className="absolute -top-2 -right-2"
                                />
                            )}
                        </div>
                        <p className="hidden md:block">{link.name}</p>
                    </Link>
                );
            })}
        </>
    );
}