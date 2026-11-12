import postgres from 'postgres';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Heading from '@/app/ui/Heading';
import YandexRequestInfo from '@/app/ui/orders/YandexRequestInfo';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

type OrderItemRow = {
  description: string;
  quantity: number;
  price_at_purchase: number;
};

type YandexOffer = {
  offer_id: string;
  expires_at?: string | number;
  offer_details?: {
    pricing?: string;
    pricing_total?: string;
  };
};

type OrderRow = {
  order_id: string;
  order_number: string;
  status: string;
  delivery_platform_station_id: string | null;
  delivery_point_address: string | null;
  yandex_request_id: string | null;
  delivery_price: number;
  total_price: number;
  payment_method: string | null;
  yandex_cancellation_status: string | null;
  created_at: Date | string;
  items: OrderItemRow[] | string;
  yandex_offers_response: unknown;
};

function getOffers(value: unknown): YandexOffer[] {
  if (typeof value !== 'object' || value === null || !('offers' in value) || !Array.isArray(value.offers)) {
    return [];
  }

  return value.offers.flatMap((offer: unknown) => {
    if (typeof offer !== 'object' || offer === null || !('offer_id' in offer) || typeof offer.offer_id !== 'string') {
      return [];
    }

    const details =
      'offer_details' in offer && typeof offer.offer_details === 'object' && offer.offer_details !== null
        ? offer.offer_details
        : undefined;
    return [{
      offer_id: offer.offer_id,
      expires_at: 'expires_at' in offer &&
        (typeof offer.expires_at === 'string' || typeof offer.expires_at === 'number')
        ? offer.expires_at
        : undefined,
      offer_details: details && {
        pricing: 'pricing' in details && typeof details.pricing === 'string' ? details.pricing : undefined,
        pricing_total: 'pricing_total' in details && typeof details.pricing_total === 'string'
          ? details.pricing_total
          : undefined,
      },
    }];
  });
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

function getYandexRequestInfo(value: unknown): unknown {
  if (typeof value !== 'object' || value === null || !('request_info' in value)) return null;
  return value.request_info;
}

function getItems(value: OrderRow['items']): OrderItemRow[] {
  if (Array.isArray(value)) return value;
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is OrderItemRow =>
      typeof item === 'object' &&
      item !== null &&
      'description' in item &&
      typeof item.description === 'string' &&
      'quantity' in item &&
      typeof item.quantity === 'number' &&
      'price_at_purchase' in item &&
      typeof item.price_at_purchase === 'number'
    );
  } catch (error) {
    console.error('Unable to parse user order items:', error);
    return [];
  }
}

const statusLabels: Record<string, string> = {
  new: 'Новый',
  paid: 'Оплачен',
  processing: 'В обработке',
  ready: 'Готов к отправке',
  shipped: 'Отправлен',
  delivered: 'Доставлен',
  recieved: 'Получен',
  cancelled: 'Отменен',
  refunded: 'Возврат',
};

export default async function UserOrdersPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('session_token')?.value;
  if (!sessionToken) redirect('/login');

  const users = await sql<{ id: string; role: string; email: string }[]>`
    SELECT u.id, u.role, u.email
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.session_token = ${sessionToken}
      AND s.expires > NOW()
      AND u.date_deleted IS NULL
    LIMIT 1
  `;
  const user = users[0];
  if (!user || user.role !== 'customer') redirect('/login');

  const existingProfiles = await sql`
    SELECT user_id
    FROM client_profiles
    WHERE user_id = ${user.id}
    LIMIT 1
  `;
  if (existingProfiles.length === 0) {
    const insertedProfiles = await sql`
      INSERT INTO client_profiles (
        user_id,
        first_name,
        second_name,
        email,
        phone_number,
        bonus_balance,
        discount_group
      )
      SELECT
        ${user.id},
        SPLIT_PART(BTRIM(o.customer_name), ' ', 1),
        BTRIM(SUBSTRING(BTRIM(o.customer_name) FROM POSITION(' ' IN BTRIM(o.customer_name)) + 1)),
        ${user.email},
        o.customer_phone,
        0.00,
        'Standard'
      FROM orders o
      WHERE (
        o.customer_user_id = ${user.id}
        OR (o.customer_user_id IS NULL AND LOWER(o.customer_email) = LOWER(${user.email}))
      )
        AND POSITION(' ' IN BTRIM(o.customer_name)) > 0
      ORDER BY o.created_at DESC
      LIMIT 1
      ON CONFLICT DO NOTHING
      RETURNING user_id
    `;
    if (insertedProfiles.length === 0) {
      const profileAfterInsert = await sql`
        SELECT user_id
        FROM client_profiles
        WHERE user_id = ${user.id}
        LIMIT 1
      `;
      if (profileAfterInsert.length === 0) {
        console.error(`Unable to create a client profile for customer ${user.id} from their order.`);
      }
    }
  }

  await sql`
    UPDATE orders
    SET customer_user_id = ${user.id}
    WHERE customer_user_id IS NULL
      AND LOWER(customer_email) = LOWER(${user.email})
  `;

  const orders = await sql<OrderRow[]>`
    SELECT
      o.order_id,
      o.order_number::text AS order_number,
      o.status,
      o.delivery_platform_station_id,
      o.delivery_point_address,
      COALESCE(o.yandex_request_id, o.yandex_offers_response->'confirmation'->>'request_id') AS yandex_request_id,
      o.delivery_price,
      o.total_price,
      o.payment_method,
      o.yandex_offers_response->'cancellation'->>'status' AS yandex_cancellation_status,
      o.created_at,
      o.yandex_offers_response,
      COALESCE(
        json_agg(json_build_object(
          'description', COALESCE(p.description, oi.product_id),
          'quantity', oi.quantity,
          'price_at_purchase', oi.price_at_purchase
        )) FILTER (WHERE oi.item_id IS NOT NULL),
        '[]'::json
      ) AS items
    FROM orders o
    LEFT JOIN order_items oi ON oi.order_id = o.order_id
    LEFT JOIN products p ON p.id = oi.product_id
    WHERE o.customer_user_id = ${user.id}
    GROUP BY o.order_id
    ORDER BY o.created_at DESC
  `;

  return (
    <main className="w-full p-4 md:px-6">
      <Heading level={2} className="mb-6">Мои заказы</Heading>
      {orders.length === 0 ? (
        <p className="rounded-xl border border-gray-200 bg-white p-6 text-gray-600">
          У вас пока нет заказов.
        </p>
      ) : (
        <div className="space-y-5">
          {orders.map((order) => {
            const items = getItems(order.items);
            const offers = getOffers(order.yandex_offers_response);
            const yandexRequestId = order.yandex_request_id ?? getYandexRequestId(order.yandex_offers_response);
            const yandexRequestInfo = getYandexRequestInfo(order.yandex_offers_response);
            return (
              <article key={order.order_id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold">Заказ №{order.order_number}</h2>
                    <p className="text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleString('ru-RU')}
                    </p>
                  </div>
                  <span className="rounded-full bg-green-50 px-3 py-1 text-sm font-semibold text-green-800">
                    {statusLabels[order.status] ?? order.status}
                  </span>
                </div>

                <ul className="mt-4 space-y-1 text-sm">
                  {items.map((item, index) => (
                    <li key={`${order.order_id}-${index}`} className="flex justify-between gap-4">
                      <span>{item.description} × {item.quantity}</span>
                      <span>{(item.price_at_purchase * item.quantity).toFixed(2)} ₽</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-4 border-t pt-3 text-sm">
                  <p>Доставка: {order.delivery_price.toFixed(2)} ₽</p>
                  {order.delivery_point_address && <p>Пункт выдачи: {order.delivery_point_address}</p>}
                  {!order.delivery_point_address && order.delivery_platform_station_id && (
                    <p>Код пункта выдачи: {order.delivery_platform_station_id}</p>
                  )}
                  {order.payment_method?.startsWith('mock_') && (
                    <p className="mt-1 text-amber-700">Оплата имитирована; денежные средства не списывались.</p>
                  )}
                  <p className="mt-2 text-right text-base font-bold">Итого: {order.total_price.toFixed(2)} ₽</p>
                </div>

                {offers.length > 0 && (
                  <div className="mt-4 rounded-lg bg-gray-50 p-3 text-sm">
                    <p className="font-semibold">
                      {yandexRequestId
                        ? `Первый оффер Яндекс.Доставки подтвержден (заявка ${yandexRequestId}):`
                        : 'Предложения Яндекс.Доставки (не подтверждены):'}
                    </p>
                    <ul className="mt-1 list-inside list-disc">
                      {offers.map((offer) => (
                        <li key={offer.offer_id}>
                          {offer.offer_details?.pricing_total ?? offer.offer_details?.pricing ?? offer.offer_id}
                          {offer.expires_at ? ` — действует до ${offer.expires_at}` : ''}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {yandexRequestId ? (
                  <YandexRequestInfo
                    orderId={order.order_id}
                    requestId={yandexRequestId}
                    initialInfo={yandexRequestInfo}
                    cancellationStatus={order.yandex_cancellation_status}
                  />
                ) : (
                  <p className="mt-4 text-sm text-gray-600">
                    <span className="font-medium">Статус доставки: </span>
                    Нет подтверждённой заявки Яндекс.Доставки.
                  </p>
                )}
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}