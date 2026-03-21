'use client'

import Image from "next/image";
import type { CartItem } from "@/app/lib/definitions";
import Counter from "@/app/ui/counter/Counter";
import PriceComponent from '@/app/ui/shoppingCart/priceComponent';
import { TrashIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

interface ShoppingCartLineProps {
  item: CartItem;
	index: number;
  onRemove: (item: CartItem) => void;
}

export default function ShoppingCartLine({ item, index, onRemove }: ShoppingCartLineProps) {
 // 1. Create a local state for quantity
  const [quantity, setQuantity] = useState(item.qty);

  // 2. Derive the updated item object to pass to PriceComponent
  const updatedItem = { ...item, qty: quantity };

  return (
    <div className="grid 
      grid-cols-1 
			sm:grid-cols-[4fr_8fr]
      lg:grid-cols-[2fr_5fr_2fr_3fr] 
      gap-4 
      lg:items-center 
      py-4 
      border-b 
      border-gray-200 
      last:border-b-0">
      
      {/* Image */}
      <div className="w-full sm:w-50 flex justify-center sm:col-span-1">
        <div className="relative w-32 h-32 sm:w-40 sm:h-40 lg:w-50 lg:h-50">
						<Image
							src={item.imageSrc}
							alt={item.description}
							fill
							sizes="124px"
							loading="eager"
							className="rounded-lg object-cover"
						/>
        </div>
      </div>

      {/* Description */}
      <div className="flex text-lg sm:text-2xl text-foreground font-extrabold  sm:col-span-1">
        {item.description}, {item.packageSize * item.measureUnit} г
      </div>

			<div className="sm:col-span-2 grid grid-cols-subgrid gap-4 sm:grid-cols-[4fr_6fr_2fr]">
				{/* Counter */}
				<div className="sm:col-span-1 flex justify-center sm:block sm:w-full">
					<Counter 
						initialValue={item.qty} 
						onChange={(newQty: number) => setQuantity(newQty)} 
						min={1}
						cartItem={item}
					/>
				</div>

				{/* Price & Total */}
				<div className="flex  items-center justify-center sm:items-end sm:col-span-1">
					<PriceComponent 
						cartItem={updatedItem}>
					</PriceComponent>
				</div>

				{/* Remove button */}
				<button className="w-full flex justify-center sm:col-span-1"
					onClick={() => onRemove(item)}>
					<TrashIcon className="w-7 h-10 text-green-900" />
				</button>
			</div>
    </div>
  );
}