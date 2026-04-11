'use client';

import { useState } from 'react';
import Image from 'next/image';
import { CreditCardIcon } from '@heroicons/react/24/outline';

type PaymentMethod = 'sbp' | 'card';

export default function PaymentOptions() {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('sbp');

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* SBP Option */}
    <label
			className={`
				border rounded-lg p-3 flex items-center gap-2 cursor-pointer
				transition-all duration-200
				${selectedMethod === 'sbp' 
					? 'border-blue-500 bg-blue-50' 
					: 'border-gray-200 hover:border-blue-400'
				}
			`}
		>
			<input
				type="radio"
				name="paymentMethod"
				value="sbp"
				checked={selectedMethod === 'sbp'}
				onChange={(e) => setSelectedMethod(e.target.value as PaymentMethod)}
				className="w-4 h-4 text-blue-500 focus:ring-blue-500"
			/>
			<div className="relative w-6 h-6">
				<Image
					src="/icons/pay_sbp.svg"
					alt='sbp'
					fill
					sizes="32px"
					loading="eager"
					className="object-contain"
				/>
			</div>
			<span className="text-xs uppercase font-bold">Система быстрых платежей</span>
		</label>

      {/* Card Option */}
      <label
        className={`
          border rounded-lg p-3 flex items-center gap-2 cursor-pointer
          transition-all duration-200
          ${selectedMethod === 'card' 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-200 hover:border-blue-400'
          }
        `}
      >
        <input
          type="radio"
          name="paymentMethod"
          value="card"
          checked={selectedMethod === 'card'}
          onChange={(e) => setSelectedMethod(e.target.value as PaymentMethod)}
          className="w-4 h-4 text-blue-500 focus:ring-blue-500"
        />
				<CreditCardIcon className="w-6 h-6 text-green-500" />
        <span className="text-xs uppercase font-bold">Банковская карта</span>
      </label>
    </div>
  );
}

