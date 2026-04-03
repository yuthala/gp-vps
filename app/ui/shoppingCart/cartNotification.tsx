'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Button from '../Button';
import { useCartStore } from '@/app/lib/useCartStore';
import { CartItem } from '@/app/lib/definitions';
import CaseNumber from '@/app/ui/shoppingCart/caseNumber';

export default function CartNotification() {
  const [shoppingCart, setShoppingCart] = useState<{cartItems: CartItem[]}>();

  useEffect(() => {
    // This only runs on the client after hydration
    const cartData = localStorage.getItem("cartKey");
    if (cartData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShoppingCart(JSON.parse(cartData));
    }
  }, []); // Empty dependency array means this runs once after mount
  
  //const [quantity, setQuantity] = useState(2);
 
	const router = useRouter();

  const handleContinueShopping = () => router.push('/catalog');
  const handleGoToCart = () => router.push('/shopping-cart');


   // resources for modal
  const dataForModal = useCartStore((state) => state.id_sizeModal);
  const data = shoppingCart?.cartItems ?? []
  // data for image
  const dataForimage = shoppingCart?.cartItems.filter(item => item.id === Number(dataForModal.id)).filter(item => item.packageSize === dataForModal.pkgSize) ?? [];
  const image_src = dataForimage[0]?.imageSrc ?? '/products/bogatyr_zubok.webp'
  //data for description
  const descr = dataForimage[0]?.description || 'no description received'
  const packageSz = dataForimage[0]?.measureUnit * dataForimage[0]?.packageSize
  //data for goods qty in shopping cart
  const cart_qty = data.length ?? 1
  // total sum
  let totalSum = 0
  data.map((item) => {
    totalSum += item.totalSum
  })

  return (
    <div className="flex items-center justify-center bg-gray-100 p-4">
      {/* Контейнер модального окна */}
      <div className="w-full max-w-200 bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100 p-4">
        <div className="flex justify-between items-center py-2">
          {/* Заголовок */}
          <div className="flex items-center gap-2 mb-6">
            <CheckCircleIcon className="h-12 w-12 text-green-500" />
            <h5 className="normal-case">
              Товар добавлен в корзину
            </h5>
          </div>

					{/* Кнопка закрытия */}
					<button 
						onClick={() => router.back()}
						className=" text-gray-400 hover:text-gray-600 transition-colors">
						<XMarkIcon className="h-7 w-7 text-gray-600" />
					</button>
				</div>

          {/* Информация о товаре */}
				<div className="py-8">
          <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
            <Image
              src={image_src}
              alt='product description'
              width={96}
              height={96}
              className="w-24 h-24 object-cover rounded-md border border-gray-100"
            />
            <div className="flex-1">
              <h6 className="leading-tight">
                {descr}, {packageSz} г.
              </h6>
            </div>
          </div>
        </div>

        {/* Футер с кнопками */}
        <div className="bg-[#e9f1e1] p-4 flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="text-gray-700">
            {/* В корзине {cart_qty} товара <br /> */}
            <CaseNumber qty={cart_qty}/>
            На сумму <span className="font-medium text-gray-800">{totalSum} р</span>
          </div>

          <div className="flex gap-3 flex-col sm:flex-row w-full sm:w-auto">
            {/* Продолжить покупки - closes modal */}
            <Button 
              color="#064929" 
              className="text-2xl uppercase font-extrabold px-2"
              onClick={handleContinueShopping}
            >
              Продолжить покупки
            </Button>

            {/* Перейти в корзину - navigates to cart */}
            <Button 
              backgroundColor="#40AD52" 
              color="text-white" 
              className="text-2xl uppercase font-extrabold px-2"
              onClick={handleGoToCart}
            >
              Перейти в корзину
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}