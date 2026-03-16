'use client'

import { CartItem } from "../../lib/definitions"
import {updateTotalSumInUI} from '@/app/lib/shoppingCartActions'
import { useEffect, useState } from 'react';

export default function PriceComponent({cartItem}: {cartItem: CartItem}) {

	 const [totalPrice, setTotalPrice] = useState(0);

	  useEffect(() => {
    // Define an internal async function if updateTotalSumInUI is a Promise
    const updatePrice = async () => {
      try {
        const result = await updateTotalSumInUI(cartItem);
        setTotalPrice(result);
      } catch (error) {
        console.error("Failed to update price:", error);
      }
    };

    updatePrice();
  }, [cartItem]);

	return (
		<div className="flex flex-col items-center justify-center">
				<span className="text-sm text-[#40AD52]">{cartItem.price} ₽/{cartItem.packageSize * cartItem.measureUnit} г</span>
        <span className="text-xl sm:text-3xl text-[#40AD52] font-bold">{totalPrice} ₽</span> 
		</div>
			
	)

}