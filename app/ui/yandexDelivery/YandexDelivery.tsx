// СТРУКТУРУ ФАЙЛА НЕ МЕНЯТЬ !!!


'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Script from 'next/script';
import { getCheckoutInfo, updateCheckoutInfo } from '@/app/lib/checkoutActions'
import type { CartItem } from '@/app/lib/definitions';
import { useCartStore } from '../../lib/useCartStore';

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    YaDelivery: any;
  }
}

interface deliveryInfo {
	price: number, 
	days: string
}

interface PackageDimensions {
  dx: number;
  dy: number;
  dz: number;
  weight_gross: number;
}

interface DeliveryOrderItem {
  productId: string;
  packageSize: number;
  quantity: number;
}

interface DeliveryApiResponse {
  error?: string;
  package?: PackageDimensions;
  sourcePlatformStationId?: string;
  price?: string | number;
  delivery_days?: string;
}

interface PickupPoint {
  id: string;
  address: {
    full_address: string;
  };
}

export default function DeliveryWidget() {

    const [deliveryInfo, setDeliveryInfo] = useState<deliveryInfo | null>(null);
    const [orderItems, setOrderItems] = useState<DeliveryOrderItem[]>([]);
    const [packageDimensions, setPackageDimensions] = useState<PackageDimensions | null>(null);
    const [sourcePlatformStationId, setSourcePlatformStationId] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isWidgetReady, setIsWidgetReady] = useState(false);
    const [widgetLoadError, setWidgetLoadError] = useState<string | null>(null);
    const widgetInitialized = useRef(false);
		const setPrice = useCartStore((state) => state.setDeliveryPrice);

  useEffect(() => {
    const loadPackageDimensions = async () => {
      try {
        const savedCart = localStorage.getItem('cartKey');
        const cart: { cartItems: CartItem[] } | null = savedCart ? JSON.parse(savedCart) : null;
        const items = cart?.cartItems.map((item) => ({
          productId: item.productId ?? String(item.id),
          productDescription: item.description,
          packageSize: item.packageSize,
          quantity: item.qty,
        })) ?? [];

        setOrderItems(items);
        const response = await fetch('/api/delivery/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items }),
        });
        const result: DeliveryApiResponse = await response.json();
        if (!response.ok || !result.package || !result.sourcePlatformStationId) {
          throw new Error(result.error || 'Не удалось рассчитать параметры посылки.');
        }

        setPackageDimensions(result.package);
        setSourcePlatformStationId(result.sourcePlatformStationId);
      } catch (error) {
        console.error('Не удалось получить параметры заказа для доставки:', error);
        setErrorMessage(error instanceof Error ? error.message : 'Не удалось рассчитать параметры посылки.');
      }
    };

    void loadPackageDimensions();
  }, []);

  const handlePickupSelect = useCallback(async (point: PickupPoint) => {
    try {
      const response = await fetch('/api/delivery/calculate', 
        {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          pickupPointId: point.id,
          items: orderItems,
        }),
      }
    );
      const result: DeliveryApiResponse = await response.json();
      if (!response.ok || result.price === undefined) {
        throw new Error(result.error || 'Не удалось рассчитать стоимость доставки.');
      }

      const priceString = String(result.price).replace(' RUB', '');
      const priceNumber = Math.round(parseFloat(priceString));
      if (!Number.isFinite(priceNumber)) {
        throw new Error('Яндекс вернул некорректную стоимость доставки.');
      }
			
			// update delivery price in zustand
			setPrice(priceNumber)
			
      setDeliveryInfo({ price: priceNumber, days: result.delivery_days ?? '' });
      setErrorMessage(null);

			// Update delivery info in local storage
      const info = getCheckoutInfo();
			info.deliveryPrice = String(result.price)
			updateCheckoutInfo(info)

    } catch (e) {
      console.error("Ошибка расчета", e);
      setErrorMessage(e instanceof Error ? e.message : 'Не удалось рассчитать стоимость доставки.');
    }
  }, [orderItems, setPrice]);

  const startWidget = useCallback(() => {
    if (
      widgetInitialized.current ||
      !packageDimensions ||
      !sourcePlatformStationId ||
      !isWidgetReady
    ) return;
    if (!window.YaDelivery) {
      console.error('Yandex Delivery script loaded without exposing YaDelivery.');
      return;
    }

    try {
      window.YaDelivery.createWidget({
        containerId: 'delivery-widget',
        params: {
          city: "Москва",
          size: {
            "height": "450px",
            "width": "100%"
          },
          source_platform_station: sourcePlatformStationId,
          physical_dims_weight_gross: packageDimensions.weight_gross,
          physical_dims_dx: packageDimensions.dx,
          physical_dims_dy: packageDimensions.dy,
          physical_dims_dz: packageDimensions.dz,
                    delivery_price: (price: number) => Math.round(price) + " руб",    // Стоимость доставки
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
      widgetInitialized.current = true;
    } catch (error) {
      console.error('Не удалось запустить виджет Яндекс Доставки:', error);
    }
  }, [isWidgetReady, packageDimensions, sourcePlatformStationId]);

  useEffect(() => {
    const handleWidgetReady = () => setIsWidgetReady(true);
    document.addEventListener('YaNddWidgetLoad', handleWidgetReady);
    return () => document.removeEventListener('YaNddWidgetLoad', handleWidgetReady);
  }, []);

  useEffect(() => {
    startWidget();
  }, [startWidget]);

  useEffect(() => {
    const handlePointSelected = (event: Event) => {
      const point = (event as CustomEvent<PickupPoint>).detail;
      void handlePickupSelect(point);

      const info = getCheckoutInfo();
      info.deliveryPointAdress = point.address.full_address;
      info.deliveryPointID = point.id;
      updateCheckoutInfo(info);
    };

    document.addEventListener('YaNddWidgetPointSelected', handlePointSelected);
    return () => {
      document.removeEventListener('YaNddWidgetPointSelected', handlePointSelected);
    };
  }, [handlePickupSelect]);

  return (
    <>
      <Script 
        src="https://widget-pvz.dostavka.yandex.net/widget.js?v=2"
        strategy="afterInteractive"
        onLoad={() => {
          if (!window.YaDelivery) console.error('Yandex Delivery script loaded without exposing YaDelivery.');
        }}
        onError={() => {
          setWidgetLoadError('Не удалось загрузить виджет Яндекс Доставки. Проверьте доступность widget-pvz.dostavka.yandex.net.');
        }}
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
       {errorMessage && (
        <p role="alert" className="mt-4 text-red-600">
          {errorMessage}
        </p>
       )}
       {widgetLoadError && (
        <p role="alert" className="mt-4 text-red-600">
          {widgetLoadError}
        </p>
       )}
    </>
  );
}
