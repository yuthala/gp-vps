"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { CartItem, MiniProductCard } from "@/app/lib/definitions";
import Heading from "../Heading";
import Pricing from '@/app/ui/Pricing';
import Button from '@/app/ui/Button';
import ShoppingCartLine from './ShoppingCartLine';
import { deleteItemFromCart } from "../../lib/shoppingCartActions";
import RecommendedProducts from "../recommendedProducts/RecommendedProducts";


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
	
	// Calculate total from cart items
	const cartTotal = shoppingCart?.cartItems.reduce((sum, item) => {
		return sum + (item.price * item.qty);
	}, 0) || 0;

  return (
    <div className="flex flex-col items-center gap-4 sm:gap-8 px-2 sm:px-4">
      <Heading level={2} className="">Корзина</Heading>
      <div className="w-full rounded-lg border  border-[#064929]/50 px-4 sm:px-8 flex flex-col divide-y divide-gray-200">
        {shoppingCart?.cartItems && shoppingCart.cartItems.length > 0 ? (
          shoppingCart.cartItems.map((item: CartItem, index: number) => (
            <div className="py-4 sm:py-8" key={index}>
							<ShoppingCartLine item={item} index={index} onRemove={() => handleRemoveItem(item)}/>
            </div>
          ))
        ) : (
          <div>Корзина пуста</div>
        )}
      </div>

			<div className="flex justify-end w-full">
				<div className="py-4 sm:py-8 w-full lg:w-2/3 border-b border-gray-200">
					<Pricing
						className="text-2xl sm:text-4xl text-foreground font-semibold uppercase"
						containerClassName="justify-between w-full"
						value={cartTotal} 
						prefix="Итого:" 
						classNameValue="text-(--secondary) text-2xl sm:text-4xl font-semibold lowercase"
					>
					</Pricing>
				</div>
			</div>
			<div className="flex justify-end w-full">
				<div className="w-full lg:w-2/3 text-gray-400 text-normal">Выбор способа доставки и оплаты на следующем шаге</div>
			</div>
			<div className="flex justify-end w-full pb-10">
				<div className="w-full lg:w-2/3 flex flex-col sm:flex-row gap-2 sm:gap-0 items-center justify-between">
					<Link href="/catalog">
						<Button
							color='#064929'
							className="text-lg font-extrabold uppercase w-full"
							borderColor='#064929'
							style={{ width: '300px' }}
						>Продолжить покупки</Button>
					</Link>

					<Link href="/checkout">
						<Button
							backgroundColor='#40AD52'
							color='text-white'
							className="text-lg font-extrabold uppercase w-full"
							borderColor='#064929'
							style={{ width: '300px' }}
						>Перейти к оформлению</Button>
					</Link>
				</div>
			</div>
			
			<div>
				<RecommendedProducts />
			</div>
    </div>
  );
}