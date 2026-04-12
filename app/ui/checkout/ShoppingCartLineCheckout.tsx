'use client'

import Image from "next/image";
import type { CartItem } from "@/app/lib/definitions";
import { useState } from "react";


interface ShoppingCartLineProps {
	item: CartItem;
}

export default function ShoppingCartLineCheckout({ item }: ShoppingCartLineProps) {

	return (
		<div className="w-full
			border-b 
			border-gray-200 
			last:border-b-0
			">
			
			{/* Image */}
			<div className="w-full flex gap-4">
				<div className="relative w-16 h-16 lg:w-24 lg:h-24 shrink-0 ">
						<Image
							src={item.imageSrc}
							alt={item.description}
							fill
							sizes="124px"
							loading="eager"
							className="rounded-lg object-cover"
						/>
				</div>

				<div className="flex flex-col justify-between flex-1 w-full">
					{/* Description */}
					<div className="text-normal sm:text-lg text-foreground font-medium wrap-break-word">
						{item.description}, {item.packageSize * item.measureUnit} г
					</div>
					{/* Price & Total */}
					<div className="text-foreground font-bold">
						{item.price} р. х {item.qty} шт.
					</div>
				</div>
			</div>
		</div>
	);
}