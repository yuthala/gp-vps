// app/api/delivery/calculate/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {

  const request = await req.json();
  const stationId: string = request.pickupPointId

  console.log('station id', stationId)
  console.log('source staion id', process.env.YANDEX_SOURCE_STATION_ID)

  try {
    const response = await fetch('https://b2b.taxi.yandex.net/api/b2b/platform/pricing-calculator?is_oversized=false', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.YANDEX_DELIVERY_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source: {
          // ID вашего склада/точки отгрузки (получается в кабинете)
          platform_station_id: `${process.env.YANDEX_SOURCE_STATION_ID}` 
        },
        destination: {
          // ID ПВЗ, который пришел из виджета
          platform_station_id: stationId
        },
        tariff: "self_pickup", // Указываем доставку до ПВЗ
        total_weight: 0, // Вес в граммах
        payment_method : "already_paid",
         places: [
                    {
                      physical_dims: {
                        weight_gross: 500,
                        dx: 15,
                        dy: 15,
                        dz: 10
                      }
                    }
                  ]
      }),
    });

    const data = await response.json();
    console.log('data from calculation', data)

    if (!response.ok) throw new Error(data.message || 'Ошибка API');

    // API возвращает детальный расчет, берем итоговую цену
    return NextResponse.json({ 
      price: data.pricing_total,
      delivery_days: data.delivery_days
    });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
