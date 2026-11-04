import { NextResponse } from 'next/server';
import postgres from 'postgres';

type OrderItem = {
  productId: string;
  productDescription?: string;
  packageSize: number;
  quantity: number;
};

type ProductLogisticsRow = {
  id: string;
  description: string;
  package_size: number[] | null;
  dx: number[] | null;
  dy: number[] | null;
  dz: number[] | null;
  weight: number[] | null;
};

function isOrderItem(value: unknown): value is OrderItem {
  if (!value || typeof value !== 'object') return false;

  const item = value as Record<string, unknown>;
  return (
    typeof item.productId === 'string' &&
    item.productId.length > 0 &&
    (item.productDescription === undefined || typeof item.productDescription === 'string') &&
    typeof item.packageSize === 'number' &&
    Number.isFinite(item.packageSize) &&
    item.packageSize > 0 &&
    typeof item.quantity === 'number' &&
    Number.isSafeInteger(item.quantity) &&
    item.quantity > 0
  );
}

export async function POST(req: Request) {
  try {
    const request: unknown = await req.json();
    if (!request || typeof request !== 'object') {
      return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
    }

    const body = request as Record<string, unknown>;
    const pickupPointId = body.pickupPointId;
    const items = body.items;

    if (
      !Array.isArray(items) ||
      items.length === 0 ||
      !items.every(isOrderItem)
    ) {
      return NextResponse.json({ error: 'Order items are missing or invalid.' }, { status: 400 });
    }

    if (pickupPointId !== undefined && (typeof pickupPointId !== 'string' || !pickupPointId)) {
      return NextResponse.json({ error: 'Pickup point is invalid.' }, { status: 400 });
    }

    const databaseUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('Database connection is not configured.');
    }

    const sourceStationId = process.env.YANDEX_SOURCE_STATION_ID;
    if (!sourceStationId) {
      throw new Error('YANDEX_SOURCE_STATION_ID is not configured.');
    }

    const sql = postgres(databaseUrl, { ssl: 'require' });
    try {
      const productIds = [...new Set(items.map((item) => item.productId))];
      const productDescriptions = [
        ...new Set(items.flatMap((item) => item.productDescription ? [item.productDescription] : [])),
      ];
      const products = await sql<ProductLogisticsRow[]>`
        SELECT id, description, package_size, dx, dy, dz, weight
        FROM products
        WHERE id IN ${sql(productIds)}
          ${productDescriptions.length ? sql`OR description IN ${sql(productDescriptions)}` : sql``}
      `;
      const productsById = new Map(products.map((product) => [product.id, product]));
      const productsByDescription = new Map(products.map((product) => [product.description, product]));

      const packageDimensions = { dx: 0, dy: 0, dz: 0, weight_gross: 0 };
      for (const item of items) {
        const product =
          productsById.get(item.productId) ||
          (item.productDescription ? productsByDescription.get(item.productDescription) : undefined);
        if (!product) {
          return NextResponse.json(
            { error: `Product ${item.productId} was not found.` },
            { status: 400 },
          );
        }

        const variantIndex = product.package_size?.findIndex(
          (size) => Number(size) === item.packageSize,
        ) ?? -1;
        const dx = Number(product.dx?.[variantIndex]);
        const dy = Number(product.dy?.[variantIndex]);
        const dz = Number(product.dz?.[variantIndex]);
        const weight = Number(product.weight?.[variantIndex]);
        if (
          variantIndex < 0 ||
          ![dx, dy, dz, weight].every((value) => Number.isFinite(value) && value > 0)
        ) {
          return NextResponse.json(
            { error: `Logistics dimensions are missing for product ${item.productId}.` },
            { status: 400 },
          );
        }

        packageDimensions.dx += dx * item.quantity;
        packageDimensions.dy += dy * item.quantity;
        packageDimensions.dz += dz * item.quantity;
        packageDimensions.weight_gross += weight * item.quantity;
      }

      if (!pickupPointId) {
        return NextResponse.json({
          package: packageDimensions,
          sourcePlatformStationId: sourceStationId,
        });
      }

      const apiToken = process.env.YANDEX_DELIVERY_TOKEN || process.env.YANDEX_API_KEY;
      if (!apiToken) {
        throw new Error('YANDEX_DELIVERY_TOKEN is not configured.');
      }

      const response = await fetch(
        'https://b2b.taxi.yandex.net/api/b2b/platform/pricing-calculator?is_oversized=false',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            source: { platform_station_id: sourceStationId },
            destination: { platform_station_id: pickupPointId },
            tariff: 'self_pickup',
            total_weight: packageDimensions.weight_gross,
            payment_method: 'already_paid',
            places: [{ physical_dims: packageDimensions }],
          }),
        },
      );

      const data: unknown = await response.json();
      if (!response.ok) {
        const message =
          data && typeof data === 'object' && 'message' in data &&
          typeof data.message === 'string'
            ? data.message
            : 'Yandex delivery calculation failed.';
        return NextResponse.json({ error: message }, { status: response.status });
      }

      if (!data || typeof data !== 'object' || !('pricing_total' in data)) {
        throw new Error('Yandex returned an invalid pricing response.');
      }

      return NextResponse.json({
        price: data.pricing_total,
        delivery_days: 'delivery_days' in data ? data.delivery_days : undefined,
        package: packageDimensions,
      });
    } finally {
      await sql.end();
    }
  } catch (error) {
    console.error('Yandex delivery calculation error:', error);
    const message = error instanceof Error ? error.message : 'Unexpected delivery calculation error.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
