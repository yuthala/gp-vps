'use client';

import { useEffect, useRef } from 'react';
import Script from 'next/script';

export default function DeliveryPage() {
  const isWidgetInitialized = useRef(false);

  useEffect(() => {
    // Безопасно приводим window к типу any локально, чтобы избежать конфликтов деклараций
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const globalWindow = window as any;

    // Функция инициализации виджета
    function startWidget() {
      if (!globalWindow.YaDelivery || isWidgetInitialized.current) return;

      globalWindow.YaDelivery.createWidget({
        containerId: 'delivery-widget',
        params: {
          city: "Москва",
          size: {
            height: "450px",
            width: "100%"
          },
          source_platform_station: "05e809bb-4521-42d9-a936-0fb0744c0fb3",
          physical_dims_weight_gross: 10000,
          delivery_price: "от 100",
          delivery_term: "от 1 дня",
          show_select_button: true,
          filter: {
            type: ["pickup_point", "terminal"],
            is_yandex_branded: false,
            payment_methods: ["already_paid", "card_on_receipt"],
            payment_methods_filter: "or"
          }
        }
      });

      isWidgetInitialized.current = true;
    }

    // Обработчик события выбора ПВЗ
    const handlePointSelected = (event: Event) => {
      const customEvent = event as CustomEvent;
      const data = customEvent.detail;
      
      if (data) {
        console.log('Выбран ПВЗ:', data.id);
        console.log('Адрес:', data.address?.full_address);
        console.log('Страна:', data.address?.country);
        console.log('Город:', data.address?.locality);
        console.log('Улица:', data.address?.street);
        console.log('Дом:', data.address?.house);
        console.log('Комментарий:', data.address?.comment);
      }
    };

    // Слушаем событие загрузки виджета и событие выбора точки
    document.addEventListener('YaNddWidgetLoad', startWidget);
    document.addEventListener('YaNddWidgetPointSelected', handlePointSelected);

    // Если скрипт уже загрузился ранее (например, при переходах внутри SPA)
    if (globalWindow.YaDelivery) {
      startWidget();
    }

    // Очищаем подписки при размонтировании компонента
    return () => {
      document.removeEventListener('YaNddWidgetLoad', startWidget);
      document.removeEventListener('YaNddWidgetPointSelected', handlePointSelected);
    };
  }, []);

  return (
    <main style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '20px', fontSize: '24px', fontWeight: 'bold' }}>
        Проверка виджета доставки Яндекс.Доставки
      </h1>
      
      {/* Контейнер для виджета */}
      <div 
        id="delivery-widget" 
        style={{ width: '100%', minHeight: '450px', background: '#f5f4f2', borderRadius: '12px' }} 
      />

      {/* Асинхронная безопасная загрузка скрипта через компонент Next.js */}
      <Script 
        src="https://widget-pvz.dostavka.yandex.net/widget.js?v=2" 
        strategy="afterInteractive"
      />
    </main>
  );
}
