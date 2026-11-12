'use client';

import { useRouter } from 'next/navigation';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Button from '../Button';
import Heading from '../Heading';

interface CheckoutNotificationProps {
	orderNumber?: string;
	customerEmail?: string;
	totalPrice?: number;
	yandexRequestId?: string | null;
	emailWarning?: string | null;
}

export default function CheckoutNotification({
	orderNumber,
	customerEmail,
	totalPrice,
	yandexRequestId,
	emailWarning,
}: CheckoutNotificationProps) {
	const router = useRouter();
	const handleClose = () => router.push('/');

	return (
  <div className="flex items-center justify-center p-4">
    <div className="flex flex-col gap-4 w-full max-w-2xl bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100 p-4 sm:p-6">
      <div className="flex justify-between items-center py-2">
        <div className="flex items-center gap-2 mb-6">
          <CheckCircleIcon className="h-12 w-12 text-green-500" />
          <Heading level={5} className="normal-case">Заказ успешно оформлен</Heading>
        </div>

        <button 
          type="button"
          onClick={handleClose}
          aria-label="Закрыть окно и перейти на главную"
          className="text-gray-400 hover:text-gray-600 transition-colors">
          <XMarkIcon className="h-7 w-7 text-gray-600" />
        </button>
      </div>

      <div className="text-foreground text-normal sm:text-lg font-medium flex flex-col gap-3">
        {orderNumber && (
          <p>Номер вашего заказа: <span className="font-bold text-green-700">{orderNumber}</span></p>
        )}
        {totalPrice !== undefined && (
          <p>Сумма заказа: <span className="font-bold">{totalPrice.toLocaleString('ru-RU')} ₽</span></p>
        )}
        {emailWarning ? (
          <p className="text-sm text-amber-700" role="status">{emailWarning}</p>
        ) : customerEmail ? (
          <p className="text-sm">Детали заказа отправлены на {customerEmail}.</p>
        ) : null}
        {yandexRequestId ? (
          <p className="text-sm">Доставка Яндекс.Доставкой оформлена. Номер заявки: <span className="font-semibold">{yandexRequestId}</span></p>
        ) : orderNumber ? (
          <p className="text-sm text-amber-700">Не удалось получить подтверждение заявки на доставку.</p>
        ) : null}
        {orderNumber && (
          <p className="text-sm text-gray-600">Оплата имитирована для тестирования; денежные средства не списывались.</p>
        )}
      </div>

      <div className="flex justify-center py-2">
        <Image
          src="/icons/checkout.png"
          alt='checkout_img'
          width={200}
          height={200}
          className="w-32 h-32 object-cover"
        />
      </div>

      <div className="flex justify-center pt-3">
        <div className="flex gap-3 flex-col sm:flex-row w-auto">
          <Button 
            type="button"
            color="#064929" 
            className="text-2xl uppercase font-extrabold px-2 transition-all duration-200 hover:opacity-90 hover:shadow-md active:opacity-100"
            onClick={handleClose}
          >
            На главную
          </Button>
        </div>
      </div>
    </div>
  </div>
);
}