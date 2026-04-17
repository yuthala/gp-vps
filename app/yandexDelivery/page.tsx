'use client';

import { useEffect } from 'react';
import Script from 'next/script';

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    YaDelivery: any;
  }
}

export default function DeliveryWidget() {
  const startWidget = () => {
    if (window.YaDelivery) {
      window.YaDelivery.createWidget({
        containerId: 'delivery-widget',
        params: {
          city: "Москва",
          size: {
            "height": "450px",
            "width": "100%"
          },
           source_platform_station: "05e809bb-4521-42d9-a936-0fb0744c0fb3",  // Станция отгрузки
                    physical_dims_weight_gross: 10000,                    // Вес отправления
                    delivery_price: (price) => price + " руб",            // Стоимость доставки
                    delivery_term: 3,                                     // Срок доставки
                    show_select_button: true,
          filter: {
            type: ["pickup_point", "terminal"],
            is_yandex_branded: false,
            payment_methods: ["already_paid", "card_on_receipt"],
            payment_methods_filter: "or"
          }
        },
      });
    }
  };

  useEffect(() => {
    // Обработчик выбора точки
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handlePointSelected = (event: any) => {
      const data = event.detail; // Данные находятся в свойстве detail
      console.log("ID: ", data.id);
      console.log("Адрес: ", data.address.full_address);
      console.log("Страна: ", data.address.country);
      console.log("Город: ", data.address.locality);
      console.log("Улица: ", data.address.street);
      console.log("Дом: ", data.address.house);
      console.log("Комментарий: ", data.address.comment);
    };

    // 1. Инициализация виджета
    if (window.YaDelivery) {
      startWidget();
    }
    document.addEventListener('YaNddWidgetLoad', startWidget);

    // 2. Подписка на выбор точки
    document.addEventListener('YaNddWidgetPointSelected', handlePointSelected);

    // Очистка при размонтировании компонента
    return () => {
      document.removeEventListener('YaNddWidgetLoad', startWidget);
      document.removeEventListener('YaNddWidgetPointSelected', handlePointSelected);
    };
  }, []);

  return (
    <>
      <Script 
        src="https://ndd-widget.landpro.site/widget.js" 
        strategy="afterInteractive"
      />
      
      <div 
        id="delivery-widget" 
        style={{ width: '100%', minHeight: '450px' }} 
      />
    </>
  );
}
