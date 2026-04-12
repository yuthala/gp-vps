'use client';

import { useState, useEffect } from "react";
import Heading from "../Heading";
import ShoppingCartLineCheckout from "./ShoppingCartLineCheckout";
import type { CartItem } from "@/app/lib/definitions";

export default function ShoppingCartComponent() {
	//получение Shopping cart после загрузки страницы
	const [shoppingCart, setShoppingCart] = useState<{cartItems: CartItem[]} >({cartItems: []});

	useEffect(() => {
			// This only runs on the client after hydration
			const cartData = localStorage.getItem("cartKey");
			if (cartData) {
				// eslint-disable-next-line react-hooks/set-state-in-effect
				setShoppingCart(JSON.parse(cartData));
			}
	}, []); // Empty dependency array means this runs once after mount

	// Calculate total from cart items
	const cartTotal = shoppingCart?.cartItems.reduce((sum, item) => {
		return sum + (item.price * item.qty);
	}, 0) || 0;

	return(
		<aside className="lg:col-span-1">
			<div className="bg-gray-50 rounded-lg p-4 md:p-6 border">
				<Heading level={3} className="pb-8 align-left text-foreground ">Ваш заказ</Heading>

					{shoppingCart.cartItems.map((item: CartItem, index: number) => (
						<div className="py-3 border-b border-gray-400" key={index}>
							<ShoppingCartLineCheckout item={item} />
						</div>
					))}
					
				<div className="pt-8 flex justify-between items-center text-2xl font-bold text-green-600">
					<span className=" uppercase">Итого:</span>
					<span>{cartTotal} р.</span>
				</div>
			</div>
		</aside>
	)
}