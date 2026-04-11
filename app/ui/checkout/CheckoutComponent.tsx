
"use client";

import { useState } from "react";
import Link from "next/link";
import Heading from "../../ui/Heading";
import Button from "../../ui/Button";
import PaymentOptions from "@/app/ui/checkout/PaymentSelector";

export default function CheckoutComponent() {
	  // Track if steps 2 and 3 are visible
  const [showRemainingSteps, setShowRemainingSteps] = useState(false);

	return(
		  <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 md:gap-8">
				<div className="lg:col-span-2 space-y-8">
					{/* ЛЕВАЯ КОЛОНКА: ФОРМЫ */}
					<div className="border border-green-500 rounded-lg p-4 md:p-6 pb-6 md:pb-12">
						
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
								<div className="pt-6 flex justify-end">
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
							)}
						</section>

						{showRemainingSteps && (
							<>
							{/* ШАГ 2: ДОСТАВКА */}
							<section className="pb-4">
								<div className="flex items-center gap-3">
									<div className=" text-green-600 text-lg font-bold w-8 h-8 rounded-md border border-green-400 flex items-center justify-center">2</div>
									<Heading level={6} className="py-6 normal-case">Способ доставки</Heading>
								</div>
								<p className="text-lg text-foreground pb-2">Выберите курьерскую службу</p>
								<select className="border p-2 rounded w-full md:w-1/2 bg-gray-50">
									<option>Выберите...</option>
									<option>5POST</option>
									<option>ОЗОН Доставка</option>
									<option>Почта России</option>
									<option>Яндекс Доставка</option>
								</select>
								
								<div className="text-normal md:text-lg text-foreground pt-8">
									<p>Укажите адрес пункта выдачи выбранной курьерской службы.</p>
									<p>Посмотреть доступные адреса пунктов выдачи можно по ссылке:</p>
									<Link href="https://fivepost.ru/point-map/" target="_blank" className="text-green-500 underline">https://fivepost.ru</Link>
								</div>

								<div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
										<select className="border p-2 rounded w-full bg-gray-50">
											<option>Выберите...</option>
										</select>
								</div>
								{/* 
								<div>
									<input type="text" placeholder="Адрес *" className="border p-2 rounded w-full bg-gray-50" />
								</div> */}
								
								<div className="pt-6 text-normal md:text-xl uppercase font-bold text-green-600">
									Стоимость доставки: <span className="text-red-500 pl-4"> р</span>
								</div>
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
					</div>


					{/* ИТОГО */}
					<div className="py-4 md:py-8">
						<section className="lg:col-span-2 space-y-8 border border-green-500 rounded-lg p-4 md:p-6 pb-6 md:pb-12">
							<div className="grid grid-cols-2 gap-4 text-foreground text-lg font-bold">
								<p>Товаров на сумму:</p>
								<p className="text-right">800 р</p>
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
				</div>
        

        {/* ПРАВАЯ КОЛОНКА: ВАШ ЗАКАЗ */}
        <aside className="lg:col-span-1">
          <div className="bg-gray-50 rounded-lg p-4 md:p-6 border">
            <Heading level={3} className="pb-8 align-left text-foreground ">Ваш заказ</Heading>
            {/* <div className="space-y-6 mb-8">
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-3 relative">
                  <div className="w-16 h-16 bg-gray-200 rounded overflow-hidden shrink-0">
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">IMG</div>
                  </div>
                  <div className="flex-1 pr-4">
                    <p className="text-sm font-medium leading-tight">
                      {item.name}, сорт {item.variety}, {item.weight}
                    </p>
                    <p className="text-sm mt-1 text-gray-600">{item.price} р x {item.quantity} шт</p>
                  </div>
                  <button className="absolute right-0 top-0 text-gray-400 hover:text-black">
										icon
                  </button>
                </div>
              ))}
            </div> */}
            
            <div className="pt-8 flex justify-between items-center text-2xl font-bold text-green-600">
              <span className=" uppercase">Итого:</span>
              <span>800 р</span>
            </div>
          </div>
        </aside>
      </div>
	)
}