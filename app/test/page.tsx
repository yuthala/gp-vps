
'use client'
import { useState } from 'react';
//import { User, Truck, CreditCard, X } from 'lucide-react'; // Используем lucide-react для иконок

interface CartItem {
  id: number;
  name: string;
  variety: string;
  weight: string;
  price: number;
  quantity: number;
}

export default function CheckoutPage() {
  const [deliveryCost, setDeliveryCost] = useState<number>(220);
  
  const cartItems: CartItem[] = [
    { id: 1, name: 'Воздушные луковицы чеснока', variety: 'Любаша', weight: '50 г', price: 320, quantity: 1 },
    { id: 2, name: 'Луковицы шалота', variety: 'Квочка', weight: '250 г', price: 480, quantity: 1 },
  ];

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className="max-w-5xl mx-auto p-6 font-sans text-gray-800 bg-white">
      <header className="mb-8">
        <button className="text-green-600 text-sm mb-4 flex items-center hover:underline">
          ‹ Вернуться в корзину
        </button>
        <h1 className="text-3xl font-bold uppercase tracking-wide">Оформление заказа</h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ЛЕВАЯ КОЛОНКА: ФОРМЫ */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* ШАГ 1: ПОЛУЧАТЕЛЬ */}
          <section className="border rounded-lg p-6 relative">
            <div className="absolute -left-3 top-6 bg-gray-200 text-gray-500 w-8 h-8 rounded-md flex items-center justify-center font-bold">1</div>
            <h2 className="text-lg font-medium mb-4 ml-4">Получатель</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder="Фамилия *" className="border p-2 rounded w-full outline-none focus:border-green-500" />
              <input type="text" placeholder="Имя *" className="border p-2 rounded w-full outline-none focus:border-green-500" />
              <input type="email" placeholder="E-mail *" className="border p-2 rounded w-full outline-none focus:border-green-500" />
              <div className="flex gap-2">
                <input type="tel" placeholder="Телефон *" className="border p-2 rounded w-full outline-none focus:border-green-500" />
                <button className="bg-yellow-400 hover:bg-yellow-500 px-4 py-2 rounded text-sm whitespace-nowrap transition-colors">
                  ПОЛУЧИТЬ КОД
                </button>
              </div>
            </div>
            <textarea 
              placeholder="Комментарий к заказу" 
              className="border p-2 rounded w-full mt-4 h-32 resize-none outline-none focus:border-green-500"
            />
            <div className="mt-6 flex justify-center">
              <button className="bg-green-600 hover:bg-green-700 text-white px-12 py-3 rounded font-bold transition-colors">
                ДАЛЕЕ
              </button>
            </div>
          </section>

          {/* ШАГ 2: ДОСТАВКА */}
          <section className="border rounded-lg p-6 relative opacity-60">
             <div className="absolute -left-3 top-6 bg-gray-200 text-gray-500 w-8 h-8 rounded-md flex items-center justify-center font-bold">2</div>
             <h2 className="text-lg font-medium mb-4 ml-4">Способ доставки</h2>
             <p className="text-sm text-gray-500 mb-2">Выберите курьерскую службу</p>
             <select className="border p-2 rounded w-full md:w-1/2 mb-4 bg-gray-50">
               <option>Выберите...</option>
             </select>
             
             <div className="text-sm space-y-1">
               <p className="text-gray-500">Посмотреть доступные адреса ПВЗ можно по ссылке:</p>
               <a href="https://5post.ru" className="text-red-500 underline">https://5post.ru</a>
             </div>

             <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <select className="border p-2 rounded w-full bg-gray-50">
                   <option>Выберите...</option>
                </select>
                <input type="text" placeholder="Адрес *" className="border p-2 rounded w-full bg-gray-50" />
             </div>
             
             <div className="mt-4 text-sm text-gray-500">
               Стоимость доставки: <span className="text-black font-bold ml-4">{deliveryCost} р</span>
             </div>
          </section>

          {/* ШАГ 3: ОПЛАТА */}
          <section className="border rounded-lg p-6 relative opacity-60">
             <div className="absolute -left-3 top-6 bg-gray-200 text-gray-500 w-8 h-8 rounded-md flex items-center justify-center font-bold">3</div>
             <h2 className="text-lg font-medium mb-4 ml-4">Способ оплаты</h2>
             <div className="flex flex-wrap gap-4">
               <div className="border rounded p-3 flex items-center gap-2 cursor-pointer hover:border-blue-400">
                 <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-[10px] text-white">SBP</div>
                 <span className="text-xs uppercase font-bold">Система быстрых платежей</span>
               </div>
               <div className="border rounded p-3 flex items-center gap-2 cursor-pointer hover:border-blue-400">
                 <div className="w-8 h-5 bg-gray-200 rounded"></div>
                 <span className="text-xs uppercase font-bold">Банковская карта</span>
               </div>
             </div>
          </section>

					
        </div>

        {/* ПРАВАЯ КОЛОНКА: ВАШ ЗАКАЗ */}
        <aside className="lg:col-span-1">
          <div className="bg-gray-50 rounded-lg p-6 border sticky top-6">
            <h2 className="text-xl font-bold uppercase mb-6">Ваш заказ</h2>
            <div className="space-y-6 mb-8">
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-3 relative">
                  <div className="w-16 h-16 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                    {/* Заглушка для фото */}
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">IMG</div>
                  </div>
                  <div className="flex-1 pr-4">
                    <p className="text-sm font-medium leading-tight">
                      {item.name}, сорт {item.variety}, {item.weight}
                    </p>
                    <p className="text-sm mt-1 text-gray-600">{item.price} р x {item.quantity} шт</p>
                  </div>
                  <button className="absolute right-0 top-0 text-gray-400 hover:text-black">
                    {/* <X size={16} /> */}
										icon
                  </button>
                </div>
              ))}
            </div>
            
            <div className="border-t pt-4 flex justify-between items-center">
              <span className="text-lg font-bold text-green-700 uppercase tracking-widest">Итого:</span>
              <span className="text-2xl font-bold">{subtotal} р</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};


