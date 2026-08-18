'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import type { CartItem } from '@/app/lib/definitions';
import { clearShoppingCart } from '@/app/lib/shoppingCartActions';
import { useCartStore } from '../../lib/useCartStore';
import Button from '../Button';
import Link from 'next/link';
import { getCheckoutInfo } from '../../lib/checkoutActions';

export default function CheckoutTotal() {
  const router = useRouter();
  const deliveryPrice = useCartStore((state) => state.deliveryPrice);
  const setDeliveryPrice = useCartStore((state) => state.setDeliveryPrice);
  const clearCookies = useCartStore((state) => state.clearData);

  const [shoppingCart, setShoppingCart] = useState<{ cartItems: CartItem[] }>({ cartItems: [] });
  const [deliveryRequestMessage, setDeliveryRequestMessage] = useState<string | null>(null);
  const [isSendingDeliveryRequest, setIsSendingDeliveryRequest] = useState(false);

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

  const cartTotal = useMemo(
    () => shoppingCart.cartItems.reduce((sum, item) => sum + item.price * item.qty, 0),
    [shoppingCart.cartItems]
  );

  const totalSum = cartTotal + deliveryPrice;
  const canCheckout = deliveryPrice !== 0;

  const sendDeliveryDetails = async () => {
    if (isSendingDeliveryRequest) return false;

    const checkoutInfo = getCheckoutInfo();
    if (!checkoutInfo.e_mail) {
      setDeliveryRequestMessage('Укажите email в форме получателя, чтобы отправить детали заказа.');
      return false;
    }

    setIsSendingDeliveryRequest(true);
    setDeliveryRequestMessage(null);

    try {
      const response = await fetch('/api/order/delivery-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: checkoutInfo.e_mail,
          name: `${checkoutInfo.userName} ${checkoutInfo.userSecondName}`.trim(),
          phone: checkoutInfo.phoneNumber,
          comment: checkoutInfo.userComments,
          deliveryPointAddress: checkoutInfo.deliveryPointAdress,
          cartItems: shoppingCart.cartItems,
          goodsTotal: cartTotal,
          deliveryPrice,
          checkoutUrl: typeof window !== 'undefined' ? window.location.href : '',
        }),
      });

      const body = await response.json().catch(() => null);
      if (!response.ok) {
        setDeliveryRequestMessage(body?.error || 'Не удалось отправить детали заказа. Попробуйте позже.');
        return false;
      }

      setDeliveryRequestMessage('Детали заказа отправлены на вашу почту.');
      return true;
    } catch (error) {
      console.error('Delivery details request error', error);
      setDeliveryRequestMessage('Ошибка при отправке письма. Попробуйте позже.');
      return false;
    } finally {
      setIsSendingDeliveryRequest(false);
    }
  };

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

        {deliveryRequestMessage && (
          <div className='rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-900'>
            {deliveryRequestMessage}
          </div>
        )}

        <Button
          onClick={async () => {
            if (isSendingDeliveryRequest) return;

            const emailSent = await sendDeliveryDetails();
            if (!emailSent) return;

            if (!canCheckout) return;

            try {
              router.push('/modal-checkout', { scroll: false });
              clearShoppingCart();
              clearCookies();
            } catch (error) {
              console.error('Failed to checkout:', error);
            }
          }}
          height={58}
          color='#064929'
          backgroundColor='#D3D34F'
          borderColor='#064929'
          className={`uppercase text-xl font-extrabold w-full transition-all duration-200 ${isSendingDeliveryRequest ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90 hover:shadow-md active:opacity-100'}`}
          disabled={isSendingDeliveryRequest}
        >
          {isSendingDeliveryRequest ? 'Отправка...' : 'Оформить заказ'}
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
