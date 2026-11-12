'use client';

import { useState, useEffect } from 'react';
import type { CartItem } from '@/app/lib/definitions';
import { useCartStore } from '../../lib/useCartStore';
import Button from '../Button';
import Link from 'next/link';

interface CheckoutTotalProps {
  isSubmittingOrder: boolean;
  orderNumber: string | null;
  mockPaymentEnabled: boolean;
}

export default function CheckoutTotal({ isSubmittingOrder, orderNumber, mockPaymentEnabled }: CheckoutTotalProps) {
  const deliveryPrice = useCartStore((state) => state.deliveryPrice);
  const setDeliveryPrice = useCartStore((state) => state.setDeliveryPrice);

  const [shoppingCart, setShoppingCart] = useState<{ cartItems: CartItem[] }>({ cartItems: [] });

  useEffect(() => {
    const cartData = localStorage.getItem('cartKey');
    if (cartData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShoppingCart(JSON.parse(cartData));
    }
  }, []);

  useEffect(() => {
    return () => {
      setDeliveryPrice(0);
    };
  }, [setDeliveryPrice]);

  const visibleCartItems = orderNumber === null ? shoppingCart.cartItems : [];
  const cartTotal = visibleCartItems.reduce((sum, item) => sum + item.price * item.qty, 0);

  const totalSum = cartTotal + deliveryPrice;
  const canCheckout = mockPaymentEnabled && deliveryPrice > 0 && visibleCartItems.length > 0;

  return (
    <div className='py-4 md:py-8'>
      <section className='lg:col-span-2 space-y-8 border border-green-500 rounded-lg p-4 md:p-6 pb-6 md:pb-12'>
        <div className='grid grid-cols-2 gap-4 text-foreground text-lg font-bold'>
          <p>Товаров на сумму:</p>
          <p className='text-right'>{cartTotal} p.</p>
          <p>Стоимость доставки:</p>
          <div className='text-right'>
            {deliveryPrice === 0 ? (
              <span className='text-yellow-700'>Стоимость доставки уточняется</span>
            ) : (
              <span>{deliveryPrice} p.</span>
            )}
          </div>
          <p className='pt-8 md:pt-12 pb-8 text-2xl md:text-3xl font-extrabold'>К ОПЛАТЕ:</p>
          <p className='text-right pt-8 md:pt-12 pb-8 text-green-600 text-2xl md:text-3xl font-extrabold'>{totalSum} р.</p>
        </div>

        {orderNumber !== null && (
          <div className='rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-900' role='status'>
            Заказ №{orderNumber} создан. Оплата имитирована для тестирования; первый оффер Яндекс.Доставки подтвержден.
          </div>
        )}

        <Button
          type="submit"
          form="checkout-form"
          height={58}
          color='#064929'
          backgroundColor='#D3D34F'
          borderColor='#064929'
          className={`uppercase text-xl font-extrabold w-full transition-all duration-200 ${isSubmittingOrder || !canCheckout || orderNumber !== null ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90 hover:shadow-md active:opacity-100'}`}
          disabled={isSubmittingOrder || !canCheckout || orderNumber !== null}
        >
          {!mockPaymentEnabled
            ? 'ТЕСТОВАЯ ОПЛАТА НЕДОСТУПНА'
            : isSubmittingOrder
              ? 'ОФОРМЛЕНИЕ...'
              : orderNumber !== null
                ? 'ЗАКАЗ ОФОРМЛЕН'
                : 'ОФОРМИТЬ ЗАКАЗ'}
        </Button>

        <div className='pt-4 text-foreground text-sm'>
          Нажимая на кнопку <span className='font-bold'>&quot;Оформить заказ&quot;</span>, вы соглашаетесь с условиями
          <Link href='/pdf/public_offer.pdf' className='text-green-600 underline' target='_blank'> &nbsp; Публичной оферты</Link> &nbsp;&nbsp;и &nbsp;
          <Link href='/pdf/policy.pdf' className='text-green-600 underline' target='_blank'> &nbsp; Политикой обработки персональных данных</Link>.&nbsp;
        </div>
      </section>
    </div>
  );
}
