import postgres from 'postgres';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  CHECKOUT_CUSTOMER_COOKIE,
  verifyCheckoutCustomerToken,
} from '@/app/lib/checkoutCustomerToken';
import { createOrder } from '@/app/lib/dbActions/ordersDBActions/ordersDBActions';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

const checkoutRequestSchema = z.object({
  checkoutRequestId: z.string().uuid(),
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().min(10).max(30),
  deliveryMethod: z.literal('yandex'),
  deliveryPointId: z.string().trim().min(1).max(100),
  deliveryPointAddress: z.string().trim().max(500).optional(),
  deliveryPrice: z.number().finite().nonnegative(),
  paymentMethod: z.enum(['sbp', 'card']),
  comment: z.string().trim().max(1000).optional(),
  cartItems: z.array(z.object({
    productSku: z.string().trim().min(1).max(100).optional(),
    description: z.string().trim().min(1).max(500).optional(),
    packageSize: z.number().finite().positive(),
    qty: z.number().int().min(1).max(100),
  }).refine((item) => item.productSku || item.description)).min(1).max(100),
});

const yandexOffersResponseSchema = z.object({
  offers: z.array(z.object({
    offer_id: z.string(),
    expires_at: z.union([z.string(), z.number()]).optional(),
    offer_details: z.object({
      pricing: z.string().optional(),
      pricing_total: z.string().optional(),
    }).passthrough().optional(),
  }).passthrough()).min(1),
}).passthrough();

type CheckoutProductRow = {
  id: string;
  description: string;
  package_size: number[] | null;
  price: number | string;
  on_stock_status: string;
  dx: number[] | null;
  dy: number[] | null;
  dz: number[] | null;
  weight: number[] | null;
};

function getCookie(request: Request, name: string): string | null {
  const cookie = request.headers.get('cookie') ?? '';
  const value = cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`))?.[1];
  return value ?? null;
}

function normalizePhone(phone: string): string | null {
  let digits = phone.replace(/\D/g, '');
  if (digits.startsWith('8')) digits = `7${digits.slice(1)}`;
  if (digits.length === 10) digits = `7${digits}`;
  return digits.length === 11 && digits.startsWith('7') ? `+${digits}` : null;
}

function getErrorMessage(value: unknown): string | null {
  if (typeof value !== 'object' || value === null || !('message' in value)) return null;
  return typeof value.message === 'string' ? value.message : null;
}

function getYandexRequestId(value: unknown): string | null {
  if (typeof value !== 'object' || value === null || !('confirmation' in value)) return null;
  const confirmation = value.confirmation;
  return typeof confirmation === 'object' &&
    confirmation !== null &&
    'request_id' in confirmation &&
    typeof confirmation.request_id === 'string'
    ? confirmation.request_id
    : null;
}

export async function POST(request: Request) {
  try {
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Mock payments are disabled in production.' },
        { status: 403 }
      );
    }

    const token = process.env.YANDEX_DELIVERY_TOKEN?.trim();
    const sourceStationId = process.env.YANDEX_SOURCE_STATION_ID?.trim();
    if (!token || !sourceStationId) {
      return NextResponse.json(
        { error: 'Configure YANDEX_DELIVERY_TOKEN and YANDEX_SOURCE_STATION_ID.' },
        { status: 503 }
      );
    }

    const parsedRequest = checkoutRequestSchema.safeParse(await request.json());
    if (!parsedRequest.success) {
      return NextResponse.json({ error: 'Invalid checkout data.' }, { status: 400 });
    }
    const body = parsedRequest.data;
    const phone = normalizePhone(body.phone);
    if (!phone) {
      return NextResponse.json({ error: 'Enter a valid Russian phone number.' }, { status: 400 });
    }
    if (body.deliveryPrice <= 0) {
      return NextResponse.json({ error: 'Select a Yandex pickup point and calculate delivery first.' }, { status: 400 });
    }

    const sessionToken = getCookie(request, 'session_token');
    const sessionRows = sessionToken
      ? await sql<{ id: string; role: string }[]>`
          SELECT u.id, u.role
          FROM sessions s
          JOIN users u ON u.id = s.user_id
          WHERE s.session_token = ${sessionToken}
            AND s.expires > NOW()
            AND u.date_deleted IS NULL
          LIMIT 1
        `
      : [];
    let customerUserId = sessionRows[0]?.role === 'customer' ? sessionRows[0].id : null;

    const checkoutToken = getCookie(request, CHECKOUT_CUSTOMER_COOKIE);
    if (!customerUserId && checkoutToken) {
      const checkoutUserId = verifyCheckoutCustomerToken(checkoutToken);
      if (checkoutUserId) {
        const checkoutUsers = await sql<{ id: string }[]>`
          SELECT id
          FROM users
          WHERE id = ${checkoutUserId}
            AND LOWER(email) = LOWER(${body.email})
            AND role = 'customer'
            AND date_deleted IS NULL
          LIMIT 1
        `;
        customerUserId = checkoutUsers[0]?.id ?? null;
      }
    }

    if (!customerUserId) {
      const checkoutUsers = await sql<{ id: string }[]>`
        SELECT u.id
        FROM users u
        LEFT JOIN client_profiles cp ON cp.user_id = u.id
        WHERE (LOWER(u.email) = LOWER(${body.email}) OR LOWER(cp.email) = LOWER(${body.email}))
          AND u.role = 'customer'
          AND u.date_deleted IS NULL
        LIMIT 1
      `;
      customerUserId = checkoutUsers[0]?.id ?? null;
    }

    const existingOrders = await sql<{
      order_id: string;
      order_number: string;
      yandex_request_id: string | null;
      total_price: number;
      yandex_offers_response: unknown;
    }[]>`
      SELECT order_id, order_number::text AS order_number, yandex_request_id, total_price, yandex_offers_response
      FROM orders
      WHERE checkout_request_id = ${body.checkoutRequestId}
      LIMIT 1
    `;
    if (existingOrders[0]) {
      if (customerUserId) {
        await sql`
          UPDATE orders
          SET customer_user_id = ${customerUserId}
          WHERE order_id = ${existingOrders[0].order_id}
            AND customer_user_id IS NULL
            AND LOWER(customer_email) = LOWER(${body.email})
        `;
      }
      const savedResponse = existingOrders[0].yandex_offers_response;
      const savedOffers =
        typeof savedResponse === 'object' &&
        savedResponse !== null &&
        'offers' in savedResponse &&
        Array.isArray(savedResponse.offers)
          ? savedResponse.offers
          : [];
      return NextResponse.json({
        ok: true,
        orderId: existingOrders[0].order_id,
        orderNumber: existingOrders[0].order_number,
        totalPrice: existingOrders[0].total_price,
        offers: savedOffers,
        yandexRequestId: existingOrders[0].yandex_request_id ?? getYandexRequestId(savedResponse),
        payment: { provider: 'mock-bank', status: 'paid' },
      });
    }

    const productSkus = [...new Set(body.cartItems.flatMap((item) => item.productSku ? [item.productSku] : []))];
    const descriptions = [...new Set(body.cartItems.flatMap((item) => item.productSku ? [] : [item.description!]))];
    const products = await sql<CheckoutProductRow[]>`
      SELECT id, description, package_size, price, on_stock_status, dx, dy, dz, weight
      FROM products
      WHERE id = ANY(${sql.array(productSkus, 1009)})
         OR description = ANY(${sql.array(descriptions, 1009)})
    `;

    const orderItems: {
      productId: string;
      selectedVariantIndex: number;
      priceAtPurchase: number;
      quantity: number;
    }[] = [];
    const yandexItems: {
      count: number;
      name: string;
      article: string;
      billing_details: { unit_price: number; assessed_unit_price: number };
      physical_dims: { dx: number; dy: number; dz: number };
      place_barcode: string;
      refused_count: number;
      fitting: boolean;
    }[] = [];
    const yandexPlaces: {
      physical_dims: { weight_gross: number; dx: number; dy: number; dz: number };
      barcode: string;
    }[] = [];
    let goodsTotal = 0;
    let unitIndex = 0;

    for (const item of body.cartItems) {
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
        return NextResponse.json({ error: `Product ${item.productSku ?? item.description} was not found.` }, { status: 400 });
      }
      if (product.on_stock_status !== 'available') {
        return NextResponse.json({ error: `Product ${product.id} is not available.` }, { status: 409 });
      }

      const packageIndex = (product.package_size ?? []).findIndex((size) => Number(size) === item.packageSize);
      if (packageIndex < 0) {
        return NextResponse.json(
          { error: `Package size ${item.packageSize} is not available for product ${product.id}.` },
          { status: 400 }
        );
      }

      const dimensions = {
        weight_gross: Math.ceil(Number(product.weight?.[packageIndex])),
        dx: Math.ceil(Number(product.dx?.[packageIndex])),
        dy: Math.ceil(Number(product.dy?.[packageIndex])),
        dz: Math.ceil(Number(product.dz?.[packageIndex])),
      };
      if (Object.values(dimensions).some((value) => !Number.isFinite(value) || value <= 0)) {
        return NextResponse.json(
          { error: `Shipping dimensions are incomplete for product ${product.id}.` },
          { status: 400 }
        );
      }

      const priceAtPurchase = Math.round(Number(product.price) * item.packageSize * 100) / 100;
      if (!Number.isFinite(priceAtPurchase) || priceAtPurchase <= 0) {
        return NextResponse.json({ error: `Product ${product.id} has an invalid price.` }, { status: 400 });
      }
      goodsTotal += priceAtPurchase * item.qty;
      orderItems.push({
        productId: product.id,
        selectedVariantIndex: packageIndex,
        priceAtPurchase,
        quantity: item.qty,
      });

      for (let quantityIndex = 0; quantityIndex < item.qty; quantityIndex += 1) {
        unitIndex += 1;
        const barcode = `${body.checkoutRequestId.slice(0, 8)}-${unitIndex}`;
        yandexItems.push({
          count: 1,
          name: product.description,
          article: product.id,
          billing_details: {
            unit_price: Math.round(priceAtPurchase * 100),
            assessed_unit_price: Math.round(priceAtPurchase * 100),
          },
          physical_dims: { dx: dimensions.dx, dy: dimensions.dy, dz: dimensions.dz },
          place_barcode: barcode,
          refused_count: 0,
          fitting: false,
        });
        yandexPlaces.push({
          physical_dims: dimensions,
          barcode,
        });
      }
    }

    const operatorRequestId = body.checkoutRequestId;
    const mockPaymentReference = `mock-${body.checkoutRequestId}`;
    const yandexResponse = await fetch(
      'https://b2b-authproxy.taxi.yandex.net/api/b2b/platform/offers/create?_send_unix=false',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          info: {
            operator_request_id: operatorRequestId,
            comment: body.comment,
          },
          source: {
            platform_station: { platform_id: sourceStationId },
          },
          destination: {
            type: 'platform_station',
            platform_station: { platform_id: body.deliveryPointId },
          },
          items: yandexItems,
          places: yandexPlaces,
          billing_info: { payment_method: 'already_paid' },
          recipient_info: {
            first_name: body.firstName,
            last_name: body.lastName,
            phone,
            email: body.email,
          },
          last_mile_policy: 'self_pickup',
          particular_items_refuse: false,
          forbid_unboxing: false,
        }),
      }
    );
    const yandexBody: unknown = await yandexResponse.json().catch(() => null);
    console.info('[Yandex offers/create] Response JSON:', JSON.stringify(yandexBody, null, 2));
    if (!yandexResponse.ok) {
      console.error('Yandex offers/create failed:', yandexBody);
      return NextResponse.json(
        { error: getErrorMessage(yandexBody) ?? 'Yandex could not create delivery offers.' },
        { status: 502 }
      );
    }

    const offersResult = yandexOffersResponseSchema.safeParse(yandexBody);
    if (!offersResult.success) {
      console.error('Yandex offers/create returned an invalid response:', yandexBody);
      return NextResponse.json({ error: 'Yandex returned no valid delivery offers.' }, { status: 502 });
    }

    const selectedOffer = offersResult.data.offers[0];
    const confirmResponse = await fetch(
      'https://b2b-authproxy.taxi.yandex.net/api/b2b/platform/offers/confirm',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ offer_id: selectedOffer.offer_id }),
      }
    );
    const confirmBody: unknown = await confirmResponse.json().catch(() => null);
    console.info('[Yandex offers/confirm] Response JSON:', JSON.stringify(confirmBody, null, 2));
    if (!confirmResponse.ok) {
      console.error('Yandex offers/confirm failed:', confirmBody);
      return NextResponse.json(
        { error: getErrorMessage(confirmBody) ?? 'Yandex could not confirm the delivery offer.' },
        { status: 502 }
      );
    }

    const confirmationResult = z.object({ request_id: z.string().min(1) }).passthrough().safeParse(confirmBody);
    if (!confirmationResult.success) {
      console.error('Yandex offers/confirm returned an invalid response:', confirmBody);
      return NextResponse.json({ error: 'Yandex returned no valid booking confirmation.' }, { status: 502 });
    }

    const mockPayment = {
      provider: 'mock-bank',
      status: 'paid',
      reference: mockPaymentReference,
      paidAt: new Date().toISOString(),
    };
    const totalPrice = Math.round((goodsTotal + body.deliveryPrice) * 100) / 100;
    const order = await createOrder({
      customerName: `${body.firstName} ${body.lastName}`.trim(),
      customerPhone: phone,
      customerEmail: body.email,
      customerUserId,
      deliveryPlatformStationId: body.deliveryPointId,
      deliveryPointAddress: body.deliveryPointAddress,
      customerComment: body.comment,
      deliveryPrice: body.deliveryPrice,
      totalPrice,
      checkoutRequestId: body.checkoutRequestId,
      paymentMethod: `mock_${body.paymentMethod}`,
      paymentReference: mockPaymentReference,
      yandexOperatorRequestId: operatorRequestId,
      yandexOffersResponse: {
        ...offersResult.data,
        selected_offer_id: selectedOffer.offer_id,
        confirmation: confirmationResult.data,
      },
      items: orderItems,
    });

    if (!order.success || !order.orderId || !order.orderNumber) {
      console.error('[Yandex booking] Shipment was confirmed but the order could not be saved:', {
        requestId: confirmationResult.data.request_id,
        operatorRequestId,
      });
      return NextResponse.json(
        { error: order.error ?? 'Unable to save the order.' },
        { status: 500 }
      );
    }

    const response = NextResponse.json({
      ok: true,
      orderId: order.orderId,
      orderNumber: order.orderNumber,
      totalPrice,
      offers: offersResult.data.offers,
      yandexRequestId: confirmationResult.data.request_id,
      payment: mockPayment,
    });
    return response;
  } catch (error) {
    console.error('Checkout order creation failed:', error);
    return NextResponse.json({ error: 'Unable to create the order.' }, { status: 500 });
  }
}
