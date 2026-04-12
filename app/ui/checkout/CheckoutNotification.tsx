'use client';

import { useRouter } from 'next/navigation';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Button from '../Button';
import Heading from '../Heading';

export default function CheckoutNotification() { 
	const router = useRouter();
	const handleContinueShopping = () => router.push('/catalog');

	return (
  <div className="flex items-center justify-center bg-gray-100 p-4">
    {/* Контейнер модального окна */}
    <div className="flex flex-col gap-4 w-full max-w-200 bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100 p-4">
      <div className="flex justify-between items-center py-2">
        {/* Заголовок */}
        <div className="flex items-center gap-2 mb-6">
          <CheckCircleIcon className="h-12 w-12 text-green-500" />
          <Heading level={5} className="normal-case">Ваш заказ успешно оформлен</Heading>
        </div>

        {/* Кнопка закрытия */}
        <button 
          onClick={handleContinueShopping}
          className="text-gray-400 hover:text-gray-600 transition-colors">
          <XMarkIcon className="h-7 w-7 text-gray-600" />
        </button>
      </div>

      <div className="text-foreground text-normal sm:text-lg font-medium flex flex-col gap-3">
        <p>Номер вашего заказа <span className="text-red-500 text-lg sm:text-xl">хххххххххх</span>.</p>
        <p>Чек будет направлен вам на электронную почту.</p>
        <p>Срок сборки 1-3 рабочих дня.</p>
        <p>После передачи заказа курьерской компании вам поступит информация для отслеживания.</p>
        <p>Вы всегда можете связаться с нами по телефону, в Телеграм или электронной почте. Контактная информация указана на сайте.</p>
      </div>

      {/* Centered Image */}
      <div className="flex justify-center py-2">
        <Image
          src="/icons/checkout.png"
          alt='checkout_img'
          width={200}
          height={200}
          className="w-32 h-32 object-cover"
        />
      </div>

      {/* Centered Button */}
      <div className="flex justify-center pt-3">
        <div className="flex gap-3 flex-col sm:flex-row w-auto">
          <Button 
            color="#064929" 
            className="text-2xl uppercase font-extrabold px-2 transition-all duration-200 hover:opacity-90 hover:shadow-md active:opacity-100"
            onClick={handleContinueShopping}
          >
            Завершить
          </Button>
        </div>
      </div>
    </div>
  </div>
);
}