import postgres from 'postgres';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { isAuthorizedAdminSession } from '@/app/lib/adminAuth';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

const yandexCancellationSchema = z.object({
  status: z.enum(['CREATED', 'SUCCESS', 'ERROR']),
  reason: z.string().optional(),
  description: z.string().optional(),
}).passthrough();

function getErrorMessage(value: unknown): string | null {
  if (typeof value !== 'object' || value === null || !('message' in value)) return null;
  return typeof value.message === 'string' ? value.message : null;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const origin = request.headers.get('origin');
    if (origin && new URL(origin).origin !== new URL(request.url).origin) {
      return NextResponse.json({ error: 'Cross-origin request rejected.' }, { status: 403 });
    }

    const cookie = request.headers.get('cookie') ?? '';
    const sessionToken = cookie.match(/(?:^|;\s*)session_token=([^;]+)/)?.[1];
    if (!await isAuthorizedAdminSession(sessionToken)) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    const { orderId } = await params;
    if (!z.string().uuid().safeParse(orderId).success) {
      return NextResponse.json({ error: 'Invalid order ID.' }, { status: 400 });
    }

    const orders = await sql<{
      yandex_request_id: string | null;
      yandex_offers_response: unknown;
    }[]>`
      SELECT yandex_request_id, yandex_offers_response
      FROM orders
      WHERE order_id = ${orderId}
      LIMIT 1
    `;
    const order = orders[0];
    if (!order) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });

    const responseData = order.yandex_offers_response;
    const responseRequestId =
      typeof responseData === 'object' &&
      responseData !== null &&
      'confirmation' in responseData &&
      typeof responseData.confirmation === 'object' &&
      responseData.confirmation !== null &&
      'request_id' in responseData.confirmation &&
      typeof responseData.confirmation.request_id === 'string'
        ? responseData.confirmation.request_id
        : null;
    const requestId = order.yandex_request_id ?? responseRequestId;
    if (!requestId) {
      return NextResponse.json(
        { error: 'This order has no confirmed Yandex delivery request to cancel.' },
        { status: 409 }
      );
    }

    const existingCancellation =
      typeof responseData === 'object' &&
      responseData !== null &&
      'cancellation' in responseData &&
      typeof responseData.cancellation === 'object' &&
      responseData.cancellation !== null
        ? yandexCancellationSchema.safeParse(responseData.cancellation)
        : null;
    if (existingCancellation?.success && existingCancellation.data.status === 'CREATED') {
      return NextResponse.json({
        ok: true,
        status: 'CREATED',
        message: existingCancellation.data.description ?? 'Cancellation request is already being processed.',
      });
    }
    if (existingCancellation?.success && existingCancellation.data.status === 'SUCCESS') {
      return NextResponse.json({ error: 'This Yandex delivery request is already cancelled.' }, { status: 409 });
    }

    const token = process.env.YANDEX_DELIVERY_TOKEN?.trim();
    if (!token) {
      return NextResponse.json({ error: 'YANDEX_DELIVERY_TOKEN is not configured.' }, { status: 503 });
    }

    const yandexResponse = await fetch(
      'https://b2b-authproxy.taxi.yandex.net/api/b2b/platform/request/cancel',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ request_id: requestId }),
      }
    );
    const yandexBody: unknown = await yandexResponse.json().catch(() => null);
    console.info('[Yandex request/cancel] Response JSON:', JSON.stringify(yandexBody, null, 2));
    if (!yandexResponse.ok) {
      console.error('[Yandex request/cancel] Request failed:', yandexBody);
      return NextResponse.json(
        { error: getErrorMessage(yandexBody) ?? 'Yandex could not cancel the delivery request.' },
        { status: 502 }
      );
    }

    const cancellation = yandexCancellationSchema.safeParse(yandexBody);
    if (!cancellation.success) {
      console.error('[Yandex request/cancel] Invalid response:', yandexBody);
      return NextResponse.json({ error: 'Yandex returned an invalid cancellation response.' }, { status: 502 });
    }

    await sql`
      UPDATE orders
      SET
        yandex_offers_response = jsonb_set(
          COALESCE(yandex_offers_response, '{}'::jsonb),
          '{cancellation}',
          ${JSON.stringify(cancellation.data)}::jsonb,
          true
        ),
        status = CASE WHEN ${cancellation.data.status} = 'SUCCESS' THEN 'cancelled' ELSE status END,
        updated_at = NOW()
      WHERE order_id = ${orderId}
    `;
    revalidatePath('/dashboard/orders');
    revalidatePath('/user-dashboard/user-orders');

    if (cancellation.data.status === 'ERROR') {
      return NextResponse.json(
        { error: cancellation.data.description ?? 'Yandex could not cancel the delivery request.' },
        { status: 502 }
      );
    }

    return NextResponse.json({
      ok: true,
      status: cancellation.data.status,
      message: cancellation.data.description ??
        (cancellation.data.status === 'SUCCESS' ? 'Yandex delivery request cancelled.' : 'Cancellation request submitted.'),
    });
  } catch (error) {
    console.error('[Admin order cancellation] Failed:', error);
    return NextResponse.json({ error: 'Unable to cancel the order.' }, { status: 500 });
  }
}
