
'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useState } from 'react';

interface ButtonCounterProps {
  initialValue?: number;
  min?: number;
  max?: number;
  className?: string;
}

export default function ButtonCounter({ 
  initialValue = 0,
  min = 0,
  max = 100,
  className = ''
}: ButtonCounterProps) {

  const [count, setCount] = useState(initialValue);

	const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSelect = (qty: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('qty', qty.toString());
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };


  const handleIncrement = () => {
    if (count < max) {
      const newValue = count + 1;
      setCount(newValue);
			handleSelect(newValue);
    }
  };

  const handleDecrement = () => {
    if (count > min) {
      const newValue = count - 1;
      setCount(newValue);
			handleSelect(newValue);
    }
  };

  return (
    <div className={`flex items-center gap-2  border border-green-500 rounded-lg text-xl text-[#064929] ${className}`}>
      <button
        onClick={handleDecrement}
        disabled={count <= min}
        className="w-12 h-12 flex items-center justify-center text-xl font-bold text-[#064929] rounded-[8px 0 0 8px] border-e border-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        -
      </button>
      
      <span className="w-16 text-center font-medium">{count}</span>
      
      <button
        onClick={handleIncrement}
        disabled={count >= max}
        className="w-12 h-12 flex items-center justify-center text-xl font-bold text-[#064929] rounded-[0 8px 8px 0] border-s border-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        +
      </button>
    </div>
  );
}