// app/api/delivery/calculate/route.ts
import { NextResponse } from 'next/server';
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!);

interface CartItemInput {
  productSku?: string;
  description?: string;
  packageSize: number;
  qty: number;
}

interface ProductDimensionsRow {
  id: string;
  description: string;
  package_size: number[] | null;
  dx: number[] | null;
  dy: number[] | null;
  dz: number[] | null;
  weight: number[] | null;
}

interface PhysicalDimensions {
  weight_gross: number;
  dx: number;
  dy: number;
  dz: number;
}

export async function POST(req: Request) {
  try {
    const request = await req.json();
    const stationId = request.pickupPointId;
    const cartItems = request.cartItems as CartItemInput[];

    if (typeof stationId !== 'string' || stationId.length === 0) {
      return NextResponse.json({ error: 'A pickup point is required.' }, { status: 400 });
    }

    if (
      !Array.isArray(cartItems) ||
      cartItems.length === 0 ||
      cartItems.some((item) =>
        !item ||
        (!item.productSku && (typeof item.description !== 'string' || !item.description)) ||
        (item.productSku !== undefined &&
          (typeof item.productSku !== 'string' || item.productSku.length === 0)) ||
        typeof item.packageSize !== 'number' ||
        !Number.isFinite(item.packageSize) ||
        !Number.isInteger(item.qty) ||
        item.qty < 1
      )
    ) {
      return NextResponse.json({ error: 'A valid cart is required to calculate delivery.' }, { status: 400 });
    }

    const skus = [...new Set(cartItems.flatMap((item) => item.productSku ? [item.productSku] : []))];
    const legacyDescriptions = [
      ...new Set(cartItems.flatMap((item) => item.productSku ? [] : [item.description!])),
    ];
    const products = await sql<ProductDimensionsRow[]>`
      SELECT id, description, package_size, dx, dy, dz, weight
      FROM products
      WHERE id = ANY(${sql.array(skus, 1009)})
        OR description = ANY(${sql.array(legacyDescriptions, 1009)})
    `;
    const productsBySku = new Map(products.map((product) => [product.id, product]));
    const places: { physical_dims: PhysicalDimensions }[] = [];

    for (const item of cartItems) {
      let product = item.productSku ? productsBySku.get(item.productSku) : undefined;
      if (!product && item.description) {
        const matchingProducts = products.filter(
          (candidate) => candidate.description === item.description
        );
        if (matchingProducts.length === 1) {
          product = matchingProducts[0];
        } else if (matchingProducts.length > 1) {
          return NextResponse.json(
            { error: `Cannot uniquely identify cart product "${item.description}".` },
            { status: 400 }
          );
        }
      }

      if (!product) {
        return NextResponse.json(
          { error: `Product ${item.productSku ?? item.description} was not found.` },
          { status: 400 }
        );
      }

      const packageIndex = (product.package_size ?? []).findIndex(
        (size) => Number(size) === item.packageSize
      );
      if (packageIndex < 0) {
        return NextResponse.json(
          { error: `Package size ${item.packageSize} is not available for product ${product.id}.` },
          { status: 400 }
        );
      }

      const physicalDims: PhysicalDimensions = {
        weight_gross: Number(product.weight?.[packageIndex]),
        dx: Number(product.dx?.[packageIndex]),
        dy: Number(product.dy?.[packageIndex]),
        dz: Number(product.dz?.[packageIndex]),
      };
      if (
        !Number.isFinite(physicalDims.weight_gross) || physicalDims.weight_gross <= 0 ||
        !Number.isFinite(physicalDims.dx) || physicalDims.dx <= 0 ||
        !Number.isFinite(physicalDims.dy) || physicalDims.dy <= 0 ||
        !Number.isFinite(physicalDims.dz) || physicalDims.dz <= 0
      ) {
        return NextResponse.json(
          { error: `Shipping dimensions are incomplete for product ${product.id}, package size ${item.packageSize}.` },
          { status: 400 }
        );
      }

      for (let unit = 0; unit < item.qty; unit += 1) {
        places.push({ physical_dims: physicalDims });
      }
    }

    const totalWeight = places.reduce(
      (total, place) => total + place.physical_dims.weight_gross,
      0
    );
    console.log('Places sent to delivery calculator:', JSON.stringify(places, null, 2));

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
        total_weight: totalWeight, // Вес в граммах
        payment_method : "already_paid",
        places,
      }),
    });

    const data = await response.json();
    console.log('data from calculation', data)

    if (!response.ok) throw new Error(data.message || 'Ошибка API');

    // API возвращает детальный расчет, берем итоговую цену
    return NextResponse.json({ 
      price: data.pricing_total,
      delivery_days: data.delivery_days,
      places,
    });
  } catch (error) {
    console.error('Delivery calculation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to calculate delivery.' },
      { status: 500 }
    );
  }
}
