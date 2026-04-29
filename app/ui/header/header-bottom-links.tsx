'use client'

import { UserCircleIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import { usePathname, useRouter } from 'next/navigation';
import clsx from 'clsx';
import CartBadge from './cartBadge';
import { useState, useEffect } from 'react';
import { getInitialValueFromCookies } from '@/app/lib/actions';
import Link from 'next/link';
import Image from 'next/image';

const links = [
    { name: 'Корзина', href: '/shopping-cart', icon: ShoppingCartIcon },
    { name: 'Вход', href: '', icon: UserCircleIcon }
]

export default function BottomHeaderLinks() {
    const pathname = usePathname();
    const router = useRouter();
    const [cartCount, setCartCount] = useState<string>('0');
    const [showSpinner, setShowSpinner] = useState(false);

    useEffect(() => {
        const fetchCartCount = async () => {
            const initialCount = await getInitialValueFromCookies();
            setCartCount(initialCount || '0');
        };
        fetchCartCount();
    }, []);

    const handleLoginClick = async (e: React.MouseEvent, link: typeof links[0]) => {
        if (link.name === 'Вход') {
            e.preventDefault();
            setShowSpinner(true);
            
            try {
                // Fetch fresh session status when button is clicked
                const res = await fetch('/api/session/validate');
                const data = await res.json();
                
                // Add delay for UX
                await new Promise(resolve => setTimeout(resolve, 500));
                
                const destination = data.ok === true ? '/dashboard' : '/login-page';
                setShowSpinner(false);
                router.push(destination);
            } catch (err) {
                console.error('Error validating session:', err);
                setShowSpinner(false);
                router.push('/login-page');
            }
        }
    };

    return (
        <>
            {/* Loading Spinner */}
            {showSpinner && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative w-24 h-24 flex items-center justify-center">
                            {/* Spinning border around logo */}
                            <div className="absolute w-32 h-32 border-4 border-transparent border-t-white border-r-white rounded-full animate-spin"></div>
                            {/* Stable logo */}
                            <Image
                                src="/greenPato-logo.webp"
                                width={96}
                                height={96}
                                alt="Loading"
                                className="relative z-10"
                            />
                        </div>
                        <p className="text-white font-semibold">Loading...</p>
                    </div>
                </div>
            )}

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