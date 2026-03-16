"use client";

import { useEffect, useState } from "react";
import type { CartItem } from "@/app/lib/definitions";
import Heading from "../Heading";
import ShoppingCartLine from './ShoppingCartLine';
import { deleteItemFromCart } from "../../lib/shoppingCartActions";

export default function ShoppingCartComponent() {
		const [shoppingCart, setShoppingCart] = useState<{cartItems: CartItem[]} | null>(null);
	
		useEffect(() => {
			// This only runs on the client after hydration
			const cartData = localStorage.getItem("cartKey");
			if (cartData) {
				setShoppingCart(JSON.parse(cartData));
			}
		}, []); // Empty dependency array means this runs once after mount

		 // Define the removal logic here
   // UPDATED Removal Logic
  const handleRemoveItem = (item: CartItem) => {
   deleteItemFromCart(item)
	 const cartData = localStorage.getItem("cartKey");
			if (cartData) {
				setShoppingCart(JSON.parse(cartData));
			}
  };
	
  return (
    <div className="flex flex-col items-center gap-4 sm:gap-8">
      <Heading level={2} className="">Корзина</Heading>
      <div className="w-full rounded-lg border  border-[#064929]/50 p-3 sm:p-8 flex flex-col gap-4 sm:gap-8">
        {shoppingCart?.cartItems && shoppingCart.cartItems.length > 0 ? (
          shoppingCart.cartItems.map((item: CartItem, index: number) => (
            <div key={index}>
							<ShoppingCartLine item={item} index={index} onRemove={() => handleRemoveItem(item)}/>
            </div>
          ))
        ) : (
          <div>Корзина пуста</div>
        )}
      </div>
    </div>
  );
}