import { useState, useEffect } from "react";
import type { CartItem } from "@/app/lib/definitions";
import Button from "../Button";
import Link from "next/link";

export default function CheckoutTotal() {
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
	
	return (
		<div className="py-4 md:py-8">
			<section className="lg:col-span-2 space-y-8 border border-green-500 rounded-lg p-4 md:p-6 pb-6 md:pb-12">
				<div className="grid grid-cols-2 gap-4 text-foreground text-lg font-bold">
					<p>Товаров на сумму:</p>
					<p className="text-right">{cartTotal} p.</p>
					<p>Стоимость доставки:</p>
					<p className="text-right">220 р</p>
					<p className="pt-8 md:pt-12 pb-8 text-2xl md:text-3xl font-extrabold">К ОПЛАТЕ:</p>
					<p className="text-right pt-8 md:pt-12 pb-8 text-green-600 text-2xl md:text-3xl font-extrabold">1020 р</p>
				</div>
				<Button
					height={58}
					color="#064929"
					backgroundColor="#D3D34F"
					borderColor="#064929"
					className="uppercase text-xl font-extrabold w-full transition-all duration-200 hover:opacity-90 hover:shadow-md active:opacity-100"
				>
					Оформить заказ
				</Button>

				<div className="pt-4 text-foreground text-sm">
					Нажимая на кнопку "Оформить заказ", вы соглашаетесь с 
					<Link href="" className="text-green-600 underline" target="_blank">Политикой конфиденциальности</Link> и даете&nbsp; 
					<Link href="" className="text-green-600 underline" target="_blank"> Cогласие на обработку персональных данных</Link>.
				</div>
			</section>
		</div>
	)
}