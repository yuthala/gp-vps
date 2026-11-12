import postgres from 'postgres';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { isAuthorizedAdminSession } from '@/app/lib/adminAuth';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

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

    const sessionToken = request.headers.get('cookie')
      ?.match(/(?:^|;\s*)session_token=([^;]+)/)?.[1];
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const users = await sql<{ id: string; role: string }[]>`
      SELECT u.id, u.role
      FROM sessions s
      JOIN users u ON u.id = s.user_id
      WHERE s.session_token = ${sessionToken}
        AND s.expires > NOW()
        AND u.date_deleted IS NULL
      LIMIT 1
    `;
    const user = users[0];
    if (!user) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    const { orderId } = await params;
    if (!z.string().uuid().safeParse(orderId).success) {
      return NextResponse.json({ error: 'Invalid order ID.' }, { status: 400 });
    }

    const orders = await sql<{
      customer_user_id: string | null;
      yandex_request_id: string | null;
      yandex_offers_response: unknown;
    }[]>`
      SELECT customer_user_id, yandex_request_id, yandex_offers_response
      FROM orders
      WHERE order_id = ${orderId}
      LIMIT 1
    `;
    const order = orders[0];
    if (!order) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });

    const isAdmin = user.role === 'admin' && await isAuthorizedAdminSession(sessionToken);
    if (!isAdmin && (user.role !== 'customer' || order.customer_user_id !== user.id)) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    const yandexResponseData = order.yandex_offers_response;
    const responseRequestId =
      typeof yandexResponseData === 'object' &&
      yandexResponseData !== null &&
      'confirmation' in yandexResponseData &&
      typeof yandexResponseData.confirmation === 'object' &&
      yandexResponseData.confirmation !== null &&
      'request_id' in yandexResponseData.confirmation &&
      typeof yandexResponseData.confirmation.request_id === 'string'
        ? yandexResponseData.confirmation.request_id
        : null;
    const requestId = order.yandex_request_id ?? responseRequestId;
    if (!requestId) {
      return NextResponse.json(
        { error: 'This order has no confirmed Yandex delivery request.' },
        { status: 409 }
      );
    }

    const token = process.env.YANDEX_DELIVERY_TOKEN?.trim();
    if (!token) {
      return NextResponse.json({ error: 'YANDEX_DELIVERY_TOKEN is not configured.' }, { status: 503 });
    }

    const historyUrl = new URL(
      'https://b2b-authproxy.taxi.yandex.net/api/b2b/platform/request/history'
    );
    historyUrl.searchParams.set('request_id', requestId);
    try {
      const historyResponse = await fetch(historyUrl, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      const historyBody: unknown = await historyResponse.json().catch(() => null);
      console.info('[Yandex request/history] Response JSON:', JSON.stringify(historyBody, null, 2));
      if (!historyResponse.ok) {
        console.error('[Yandex request/history] Request failed with status:', historyResponse.status);
      }
    } catch (historyError) {
      console.error('[Yandex request/history] Request failed:', historyError);
    }

    const infoUrl = new URL(
      'https://b2b-authproxy.taxi.yandex.net/api/b2b/platform/request/info'
    );
    infoUrl.searchParams.set('request_id', requestId);
    const yandexResponse = await fetch(infoUrl, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    const yandexBody: unknown = await yandexResponse.json().catch(() => null);
    if (!yandexResponse.ok) {
      console.error('[Yandex request/info] Request failed with status:', yandexResponse.status);
      return NextResponse.json(
        { error: getErrorMessage(yandexBody) ?? 'Yandex could not retrieve delivery information.' },
        { status: 502 }
      );
    }
    if (typeof yandexBody !== 'object' || yandexBody === null || Array.isArray(yandexBody)) {
      console.error('[Yandex request/info] Invalid response body.');
      return NextResponse.json({ error: 'Yandex returned an invalid delivery response.' }, { status: 502 });
    }

    const info = yandexBody as Record<string, unknown>;
    await sql`
      UPDATE orders
      SET yandex_offers_response = jsonb_set(
        CASE
          WHEN jsonb_typeof(yandex_offers_response) = 'string'
            THEN (yandex_offers_response #>> '{}')::jsonb
          ELSE COALESCE(yandex_offers_response, '{}'::jsonb)
        END,
        '{request_info}',
        ${JSON.stringify(info)}::jsonb,
        true
      )
      WHERE order_id = ${orderId}
    `;

    revalidatePath('/dashboard/orders');
    revalidatePath('/user-dashboard/user-orders');
    return NextResponse.json({ ok: true, info });
  } catch (error) {
    console.error('[Yandex request/info] Failed:', error);
    return NextResponse.json({ error: 'Unable to retrieve Yandex delivery information.' }, { status: 500 });
  }
}
