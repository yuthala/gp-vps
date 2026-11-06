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

interface BoxDimensions {
  weight_gross: number;
  dx: number;
  dy: number;
  dz: number;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const cartItems = body.cartItems as CartItemInput[];

    console.info('[Delivery dimensions] Cart received:', cartItems);
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
      return NextResponse.json({ error: 'A valid cart is required to calculate package dimensions.' }, { status: 400 });
    }

    const skus = [...new Set(cartItems.flatMap((item) => item.productSku ? [item.productSku] : []))];
    const descriptions = [
      ...new Set(cartItems.flatMap((item) => item.productSku ? [] : [item.description!])),
    ];
    const products = await sql<ProductDimensionsRow[]>`
      SELECT id, description, package_size, dx, dy, dz, weight
      FROM products
      WHERE id = ANY(${sql.array(skus, 1009)})
        OR description = ANY(${sql.array(descriptions, 1009)})
    `;
    console.info('[Delivery dimensions] Products found:', products.length);

    const boxes: BoxDimensions[] = [];
    for (const item of cartItems) {
      let product = item.productSku
        ? products.find((candidate) => candidate.id === item.productSku)
        : undefined;

      if (!product && item.description) {
        const matches = products.filter((candidate) => candidate.description === item.description);
        if (matches.length > 1) {
          return NextResponse.json(
            { error: `Cannot uniquely identify cart product "${item.description}".` },
            { status: 400 }
          );
        }
        product = matches[0];
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

      const box: BoxDimensions = {
        weight_gross: Number(product.weight?.[packageIndex]),
        dx: Number(product.dx?.[packageIndex]),
        dy: Number(product.dy?.[packageIndex]),
        dz: Number(product.dz?.[packageIndex]),
      };
      if (
        !Number.isFinite(box.weight_gross) || box.weight_gross <= 0 ||
        !Number.isFinite(box.dx) || box.dx <= 0 ||
        !Number.isFinite(box.dy) || box.dy <= 0 ||
        !Number.isFinite(box.dz) || box.dz <= 0
      ) {
        return NextResponse.json(
          { error: `Shipping dimensions are incomplete for product ${product.id}, package size ${item.packageSize}.` },
          { status: 400 }
        );
      }

      console.info('[Delivery dimensions] Product package resolved:', {
        productSku: product.id,
        packageSize: item.packageSize,
        quantity: item.qty,
        box,
      });
      for (let unit = 0; unit < item.qty; unit += 1) {
        boxes.push(box);
      }
    }

    console.info('[Delivery dimensions] Expanded boxes:', boxes.length);
    return NextResponse.json({ boxes });
  } catch (error) {
    console.error('[Delivery dimensions] Failed to load product dimensions:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to load product dimensions.' },
      { status: 500 }
    );
  }
}
