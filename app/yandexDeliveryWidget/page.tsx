'use client';

import { useState, useEffect } from 'react';
import Script from 'next/script';

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    YaDelivery: any;
  }
}

export default function DeliveryWidget() {
    const [deliveryInfo, setDeliveryInfo] = useState<{price: number, days: string} | null>(null);

    // 1. ФУНКЦИЯ ОБРАБОТКИ (куда отправляем данные ПВЗ)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handlePickupSelect = async (data: any) => {
    
    try {
      const response = await fetch('/api/delivery/calculate', 
        {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          pickupPointId: data.id, // Это ID выбранного ПВЗ
          weight: 500
        }),
      }
    );
      const result = await response.json();
      console.log('price request result',result)
      setDeliveryInfo({ price: result.price, days: result.delivery_days });
    } catch (e) {
      console.error("Ошибка расчета", e);
    }
  };

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
           source_platform_station: "019bdf90b35574099e55239ae3fe8d91",  // Станция отгрузки
                    physical_dims_weight_gross: 500,                    // Вес отправления
                    delivery_price: (price: number) => price.toFixed() + " руб",    // Стоимость доставки
                    delivery_term: "от 2 дня",                                     // Срок доставки
                    show_select_button: true,
          filter: {
            type: ["pickup_point", "terminal"],
            is_yandex_branded: false,
            payment_methods: ["already_paid"],
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
   
      const data = event.detail;  // Данные находятся в свойстве detail
      handlePickupSelect(data)
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

       {deliveryInfo && (
        <div className="mt-4 p-4 bg-green-50 rounded">
          <p>Стоимость: <b>{deliveryInfo.price} ₽</b></p>
          <p>Срок: <b>{deliveryInfo.days}</b></p>
        </div>
       )}
    </>
  );
}
