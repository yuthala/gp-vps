'use client';

import { useState } from 'react';
import Image from 'next/image';
import { CreditCardIcon } from '@heroicons/react/24/outline';

type PaymentMethod = 'sbp' | 'card';

interface PaymentOptionsProps {
  selectedMethod?: PaymentMethod;
  onChange?: (method: PaymentMethod) => void;
  disabled?: boolean;
}

export default function PaymentOptions({ selectedMethod, onChange, disabled = false }: PaymentOptionsProps) {
  const [uncontrolledMethod, setUncontrolledMethod] = useState<PaymentMethod>('sbp');
  const currentMethod = selectedMethod ?? uncontrolledMethod;
  const updateMethod = (method: PaymentMethod) => {
    if (onChange) onChange(method);
    else setUncontrolledMethod(method);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* SBP Option */}
    <label
			className={`
				border rounded-lg p-3 flex items-center gap-2 cursor-pointer
				transition-all duration-200
				${currentMethod === 'sbp' 
					? 'border-blue-500 bg-blue-50' 
					: 'border-gray-200 hover:border-blue-400'
				}
			`}
		>
			<input
				type="radio"
				name="paymentMethod"
				value="sbp"
				checked={currentMethod === 'sbp'}
				disabled={disabled}
				onChange={() => updateMethod('sbp')}
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
          ${currentMethod === 'card' 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-200 hover:border-blue-400'
          }
        `}
      >
        <input
          type="radio"
          name="paymentMethod"
          value="card"
          checked={currentMethod === 'card'}
          disabled={disabled}
          onChange={() => updateMethod('card')}
          className="w-4 h-4 text-blue-500 focus:ring-blue-500"
        />
				<CreditCardIcon className="w-6 h-6 text-green-500" />
        <span className="text-xs uppercase font-bold">Банковская карта</span>
      </label>
    </div>
  );
}

