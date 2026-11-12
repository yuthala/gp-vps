'use client';

import { useEffect, useRef, useState } from 'react';

interface SelectedDelivery {
  mode: string;
  tariffName: string;
  price: number;
  address: string;
  code?: string;
}

export default function CheckoutPage() {
  const widgetRef = useRef<unknown>(null);
  const [selectedDelivery, setSelectedDelivery] = useState<SelectedDelivery | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initWidget = async () => {
      // Динамический импорт предотвращает ошибки SSR (window is not defined)
      const { default: CDEKWidget } = await import('@cdek-it/widget');

      if (!isMounted || widgetRef.current) return;

   // @ts-expect-error В типах @cdek-it/widget все опциональные поля ошибочно помечены как обязательные
widgetRef.current = new CDEKWidget({
  from: {
    country_code: 'RU',
    city: 'Москва',
    postal_code: '101000',
    code: 44,
    address: 'ул. Тверская, д. 1',
  },
  root: 'cdek-map',
  apiKey: process.env.NEXT_PUBLIC_YANDEX_MAPS_KEY || '',
  servicePath: '/api/cdek',
  defaultLocation: 'Москва',
  goods: [
    {
      width: 20,
      height: 15,
      length: 10,
      weight: 1.5,
    },
  ],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChoose(deliveryMode: string, rate: any, address: any) {
    setSelectedDelivery({
      mode: deliveryMode === 'office' ? 'До пункта выдачи (ПВЗ)' : 'Курьером до двери',
      tariffName: rate?.tariff_name || 'Стандарт',
      price: rate?.delivery_sum || 0,
      address: address?.address || address?.formatted || '',
      code: address?.code,
    });
  },
});

    };

    initWidget();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
        Выбор пункта выдачи СДЭК
      </h1>

      {selectedDelivery && (
        <div
          style={{
            padding: '16px',
            marginBottom: '20px',
            border: '1px solid #1ab248',
            borderRadius: '8px',
            backgroundColor: '#f2fbf5',
          }}
        >
          <p><strong>Способ доставки:</strong> {selectedDelivery.mode}</p>
          <p><strong>Тариф:</strong> {selectedDelivery.tariffName}</p>
          <p><strong>Стоимость:</strong> {selectedDelivery.price} ₽</p>
          <p><strong>Адрес / ПВЗ:</strong> {selectedDelivery.address} {selectedDelivery.code ? `(код: ${selectedDelivery.code})` : ''}</p>
        </div>
      )}

      {/* Контейнер обязан иметь фиксированную высоту и не иметь лишних отступов */}
      <div
        id="cdek-map"
        style={{
          width: '100%',
          height: '600px',
        }}
      />
    </main>
  );
}
