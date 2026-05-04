"use client";

import { useState } from "react";
import Heading from "../../ui/Heading";
import Button from "../../ui/Button";
import PaymentOptions from "@/app/ui/checkout/PaymentSelector";
import DeliveryWidget from "../yandexDelivery/YandexDelivery";
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import Link from "next/link";

export default function CheckoutForm() {
		// Track if steps 2 and 3 are visible
	  const [showRemainingSteps, setShowRemainingSteps] = useState(false);
		//show Delivery Widget if respective option selected
		const [selectedDelivery, setSelectedDelivery] = useState('');

	return (
		<form>
			{/* ШАГ 1: ПОЛУЧАТЕЛЬ */}
			<section className="pb-4">
				<div className="flex items-center gap-3">
					<div className=" text-green-600 text-lg font-bold w-8 h-8 rounded-md border border-green-400 flex items-center justify-center">1</div>
					<Heading level={6} className="py-4 normal-case">Получатель</Heading>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<input type="text" placeholder="Фамилия *" className="border p-2 rounded w-full outline-none focus:border-green-500" required/>
					<input type="text" placeholder="Имя *" className="border p-2 rounded w-full outline-none focus:border-green-500" required/>
					<input type="email" placeholder="E-mail *" className="border p-2 rounded w-full outline-none focus:border-green-500" required/>
					<div className="flex gap-2">
						<input type="tel" placeholder="Телефон *" className="border p-2 rounded w-full outline-none focus:border-green-500" required/>
					</div>
				</div>
				<div className="pt-6">
					<textarea 
						placeholder="Комментарий к заказу" 
						className="border p-2 rounded w-full h-32 resize-none outline-none focus:border-green-500"
					/>
				</div>
				{!showRemainingSteps && (
					<div className="flex flex-col">
						<div className="pt-6">
							<Button 
							onClick={() => setShowRemainingSteps(true)}
							height={40}
							color="#F2F9ED"
							backgroundColor="#40AD52"
							borderColor="#064929"
							className="text-lg font-bold uppercase transition-all duration-200 hover:opacity-90 hover:shadow-md active:opacity-100">
								ДАЛЕЕ
							</Button>
						</div>
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
				)}
			</section>

			{showRemainingSteps && (
				<>
				{/* ШАГ 2: ДОСТАВКА */}
				<section className="flex flex-col gap-4 pb-4">
					<div className="flex items-center gap-3">
						<div className=" text-green-600 text-lg font-bold w-8 h-8 rounded-md border border-green-400 flex items-center justify-center">2</div>
						<Heading level={6} className="pt-2 normal-case">Способ доставки</Heading>
					</div>
					<p className="text-lg text-foreground">Выберите курьерскую службу</p>
					<div className="relative">
						<select 
							value={selectedDelivery} 
							onChange={(e) => setSelectedDelivery(e.target.value)}
							className="appearance-none border p-3 rounded w-full md:w-1/2 bg-gray-50">
							<option value="">Выберите...</option>
							<option value="5post">5POST</option>
							<option value="ozon">ОЗОН Доставка</option>
							<option value="russian_post">Почта России</option>
							<option value="yandex">Яндекс Доставка</option>
						</select>
						<ChevronDownIcon 
							className="absolute 
								top-1/2 
								-translate-y-1/2 
								w-5 h-5 
								text-gray-400 
								pointer-events-none
								right-2.5 
								md:right-[calc(50%+10px)]"
						/>
					</div>


					{/* Conditionally render DeliveryWidget */}
      		{selectedDelivery === 'yandex' && <DeliveryWidget />}
					
					{/* <div className="text-normal md:text-lg text-foreground pt-8">
						<p>Укажите адрес пункта выдачи выбранной курьерской службы.</p>
						<p>Посмотреть доступные адреса пунктов выдачи можно по ссылке:</p>
						<Link href="https://fivepost.ru/point-map/" target="_blank" className="text-green-500 underline">https://fivepost.ru</Link>
					</div> */}

					{/* <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
							<select className="border p-2 rounded w-full bg-gray-50">
								<option>Выберите...</option>
							</select>
					</div> */}
					{/* 
					<div>
						<input type="text" placeholder="Адрес *" className="border p-2 rounded w-full bg-gray-50" />
					</div> */}
					
					{/* <div className="pt-6 text-normal md:text-xl uppercase font-bold text-green-600">
						Стоимость доставки: <span className="text-red-500 pl-4"> р</span>
					</div> */}
				</section>

				{/* ШАГ 3: ОПЛАТА */}
				<section className="py-2 md:py-4">
					<div className="flex items-center gap-3">
						<div className=" text-green-600 text-lg font-bold w-8 h-8 rounded-md border border-green-400 flex items-center justify-center">3</div>
						<Heading level={6} className="py-6 normal-case">Способ оплаты</Heading>
					</div>
					<PaymentOptions />
				</section>
			</>
			)}
		</form>
	) 
}