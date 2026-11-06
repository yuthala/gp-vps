/* eslint-disable react-hooks/immutability */
// СТРУКТУРУ ФАЙЛА НЕ МЕНЯТЬ !!!


'use client';

import { useState, useEffect } from 'react';
import Script from 'next/script';
//import { checkoutInfo } from '@/app/lib/definitions'
import { getCheckoutInfo, updateCheckoutInfo } from '@/app/lib/checkoutActions'
import { useCartStore } from '../../lib/useCartStore';

export interface BoxDimensions {
  weight_gross: number;
  dx: number;
  dy: number;
  dz: number;
}

export interface VirtualDimensions {
  dx: number;
  dy: number;
  dz: number;
  weight: number;
}

interface DeliveryWidgetProps {
  boxes: BoxDimensions[];
}

export function calculateSmart3DBox(boxes: BoxDimensions[]): VirtualDimensions {
  if (!boxes || boxes.length === 0) {
    return { dx: 10, dy: 10, dz: 10, weight: 0 };
  }

  let totalVolume = 0;
  let totalWeight = 0;
  let maxDx = 0;
  let maxDy = 0;
  let maxDz = 0;

  boxes.forEach((box, index) => {
    const boxVolume = box.dx * box.dy * box.dz;
    totalVolume += boxVolume;
    totalWeight += box.weight_gross;
    maxDx = Math.max(maxDx, box.dx);
    maxDy = Math.max(maxDy, box.dy);
    maxDz = Math.max(maxDz, box.dz);
    console.info('[Yandex delivery] Box processed:', {
      index: index + 1,
      box,
      volume: boxVolume,
      totalVolume,
      totalWeight,
    });
  });

  const cubeSide = Math.ceil(Math.cbrt(totalVolume));
  const dimensions = {
    dx: Math.max(maxDx, Math.ceil(cubeSide * 1.2)),
    dy: Math.max(maxDy, Math.ceil(cubeSide * 1.1)),
    dz: Math.max(maxDz, Math.ceil(cubeSide * 1.1)),
    weight: totalWeight,
  };
  console.info('[Yandex delivery] Final box dimensions:', dimensions);
  return dimensions;
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    YaDelivery: any;
    YaNddWidgetReady?: boolean;
  }
}

if (typeof document !== 'undefined') {
  document.addEventListener('YaNddWidgetLoad', () => {
    window.YaNddWidgetReady = true;
  });
}

interface deliveryInfo {
	price: number, 
	days: string
}

export default function DeliveryWidget({ boxes }: DeliveryWidgetProps) {

    const [deliveryInfo, setDeliveryInfo] = useState<deliveryInfo | null>(null);
		// eslint-disable-next-line prefer-const
		let info = getCheckoutInfo()
		const setPrice = useCartStore((state) => state.setDeliveryPrice);

    // 1. ФУНКЦИЯ ОБРАБОТКИ (куда отправляем данные ПВЗ)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handlePickupSelect = async (data: any) => {
    try {
      const savedCart = localStorage.getItem('cartKey');
      const cartItems = savedCart
        ? (JSON.parse(savedCart) as {
            cartItems: {
              productSku?: string;
              description: string;
              packageSize: number;
              qty: number;
            }[];
          }).cartItems.map(({ productSku, description, packageSize, qty }) => ({
            productSku,
            description,
            packageSize,
            qty,
          }))
        : [];

      const response = await fetch('/api/delivery/calculate', 
        {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          pickupPointId: data.id, // Это ID выбранного ПВЗ
          cartItems,
        }),
      }
    );
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Не удалось рассчитать стоимость доставки.');
      }
      // console.log('Places sent to delivery calculator:', result.places);

      // Цена от Яндекс приходит как строка
			const priceString: string = result.price.replace(' RUB', ''); //  Убрали RUB из строки
			const priceNumber = Math.round(parseFloat(priceString)) // Округлили до целого числа
			
			// update delivery price in zustand
			setPrice(priceNumber)
			
      setDeliveryInfo({ price: priceNumber , days: result.delivery_days });

			// Update delivery info in local storage
			info.deliveryPrice = result.price
			updateCheckoutInfo(info)

    } catch (e) {
      console.error("Ошибка расчета", e);
    }
  };

  useEffect(() => {
    console.info('[Yandex delivery] Boxes received by widget:', boxes);
    let disposed = false;
    let started = false;

    const startWidget = () => {
      if (disposed || started) return;
      if (!window.YaDelivery) {
        console.error('[Yandex delivery] Ready event fired without the YaDelivery API.');
        return;
      }

      const container = document.getElementById('delivery-widget');
      if (!container) {
        console.error('[Yandex delivery] Widget container was not found.');
        return;
      }

      started = true;
      const dimensions = calculateSmart3DBox(boxes);
      console.info('[Yandex delivery] Initializing ready widget with dimensions:', dimensions);
      try {
        window.YaDelivery.createWidget({
          containerId: 'delivery-widget',
          params: {
            city: "Москва",
            size: {
              "height": "450px",
              "width": "100%"
            },
            source_platform_station: "019bdf90b35574099e55239ae3fe8d91",
            physical_dims_weight_gross: dimensions.weight,
            physical_dims_dx: dimensions.dx,
            physical_dims_dy: dimensions.dy,
            physical_dims_dz: dimensions.dz,
            delivery_price: (price: number) => Math.round(price) + " руб",
            delivery_term: 0,
            show_select_button: true,
            filter: {
              type: ["pickup_point", "terminal"],
              is_yandex_branded: false,
              payment_methods: ["already_paid"],
              payment_methods_filter: "or"
            }
          },
        });
      } catch (error) {
        started = false;
        console.error('[Yandex delivery] Widget initialization failed:', error);
      }
    };

    const handleWidgetReady = () => {
      window.YaNddWidgetReady = true;
      console.info('[Yandex delivery] Yandex widget and map APIs are ready.');
      startWidget();
    };

    // Обработчик выбора точки
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handlePointSelected = (event: any) => {
   
      const data = event.detail;  // Данные находятся в свойстве detail
      handlePickupSelect(data);
      console.log("ID: ", data.id);
      console.log("Адрес: ", data.address.full_address);
      console.log("Страна: ", data.address.country);
      console.log("Город: ", data.address.locality);
      console.log("Улица: ", data.address.street);
      console.log("Дом: ", data.address.house);
      console.log("Комментарий: ", data.address.comment);

			// Update delivery info in local starage
			info.deliveryPointAdress = data.address.full_address
			info.deliveryPointID = data.id
			updateCheckoutInfo(info)
		
		};

    document.addEventListener('YaNddWidgetLoad', handleWidgetReady);

    document.addEventListener('YaNddWidgetPointSelected', handlePointSelected);
    if (window.YaNddWidgetReady) {
      startWidget();
    }

    // Очистка при размонтировании компонента
    return () => {
      disposed = true;
      document.removeEventListener('YaNddWidgetLoad', handleWidgetReady);
      document.removeEventListener('YaNddWidgetPointSelected', handlePointSelected);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boxes]);

  return (
    <>
      <Script
        src="https://widget-pvz.dostavka.yandex.net/widget.js?v=2"
        strategy="afterInteractive"
        onError={() => console.error('[Yandex delivery] Failed to load the widget script.')}
      />
      <div 
        id="delivery-widget" 
        style={{ width: '100%', minHeight: '450px' }} 
      />

       {deliveryInfo && (
        <div className="mt-4 p-4 bg-green-50 rounded text-foreground text-lg font-bold">
          <p>Стоимость доставки: <span className="text-xl">{deliveryInfo.price} ₽</span></p>
          <p>Срок доставки в днях: <span className="text-xl">{deliveryInfo.days}</span></p>
        </div>
       )}
    </>
  );
}
