'use client'
import { useCartStore } from '@/app/lib/useCartStore';
import { useEffect, useState } from 'react';
import clsx from 'clsx';

interface CartBadgeProps {
    initialCount?: string;
    className?: string;
}

export default function CartBadge({ initialCount = '0', className }: CartBadgeProps) {
	const [isHydrated, setIsHydrated] = useState(false);
  const count = useCartStore((state) => state.items.length)
  console.log('count', count)

  // Once this runs, we know the Client Store has loaded from LocalStorage/Cookies
  useEffect(() => {
			setIsHydrated(true);
  }, [])

	//useCartStore
  // Если в сторе пусто (первая загрузка), показываем данные из кук
  // 1. Before hydration: Show Server Value (No jump/flicker)
  // 2. After hydration: Show real Client Value (even if it's 0)
 const displayCount = isHydrated ? count : parseInt(initialCount);

   // Hide badge when count is 0
  if (displayCount === 0) {
    return null;
  }

  return (
		<div className={clsx(
    'absolute -top-2 -right-2 min-w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1', className
			)}>
					{displayCount > 99 ? '99+' : displayCount}
			</div>
  )
}