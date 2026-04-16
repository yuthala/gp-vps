'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from "react";
import type { CartItem } from "@/app/lib/definitions";
import { clearShoppingCart} from '@/app/lib/shoppingCartActions';
import { useCartStore } from "../../lib/useCartStore";
import Button from "../Button";
import Link from "next/link";
import { clear } from 'node:console';

export default function CheckoutTotal() {
	//получение Shopping cart после загрузки страницы
		const [shoppingCart, setShoppingCart] = useState<{cartItems: CartItem[]} >({cartItems: []});
	
		useEffect(() => {
				// This only runs on the client after hydration
				const cartData = localStorage.getItem("cartKey");
				if (cartData) {
					setShoppingCart(JSON.parse(cartData));
				}
		}, []); // Empty dependency array means this runs once after mount
	
		// Calculate total from cart items
		const cartTotal = shoppingCart?.cartItems.reduce((sum, item) => {
			return sum + (item.price * item.qty);
		}, 0) || 0;

		//для открытия модального окна
		const router = useRouter();

		//для очистки куков
		const clearCookies = useCartStore((state) => state.clearData); 
	
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
					onClick={async function () {
							try {
									router.push('/modal-checkout', { scroll: false }); // Redirect using Next.js router
									clearShoppingCart();//очищаем корзину
									clearCookies();//устанавливаем куки 0 по ключу cart_count
									
							} catch (error) {
									console.error('Failed to checkout:', error);
							}
					}}
					height={58}
					color="#064929"
					backgroundColor="#D3D34F"
					borderColor="#064929"
					className="uppercase text-xl font-extrabold w-full transition-all duration-200 hover:opacity-90 hover:shadow-md active:opacity-100"
				>
					Оформить заказ
				</Button>

				<div className="pt-4 text-foreground text-sm">
					Нажимая на кнопку <span className="font-bold">&quot;Оформить заказ&quot;</span>, вы соглашаетесь с условиями
					<Link href="/pdf/public_offer.pdf" className="text-green-600 underline" target="_blank">&nbsp; Публичной оферты</Link> и &nbsp; 
					<Link href="/pdf/policy.pdf" className="text-green-600 underline" target="_blank">&nbsp; Политикой обработки персональных данных</Link>.&nbsp; 
					<div className="flex pt-3">
						<label className="inline-flex gap-1 pr-2 pt-1.25">
							<input type="checkbox" defaultChecked={false} className="w-3.5 h-3.5 rounded border-gray-300 text-green-600 focus:ring-green-500" />
						</label> 
						<div>
							<span className="text-foreground">Подтверждаю свое</span>
							<Link href="/pdf/agreement_pd.pdf" className="text-green-600 underline" target="_blank">&nbsp;&nbsp;Cогласие на обработку персональных данных</Link>.
						</div>
					</div>
				</div>
			</section>
		</div>
	)
}