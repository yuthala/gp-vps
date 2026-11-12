'use server';

import postgres from 'postgres';
import { revalidatePath } from 'next/cache';
import { AdminOrderListItem, CreateOrderInput, UpdateOrderInput } from './ordersTypes';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

// ==========================================
// 1. CREATE (Создание заказа и его состава)
// ==========================================
export async function createOrder(input: CreateOrderInput) {
  const confirmation = input.yandexOffersResponse.confirmation;
  const yandexRequestId =
    typeof confirmation === 'object' &&
    confirmation !== null &&
    'request_id' in confirmation &&
    typeof confirmation.request_id === 'string'
      ? confirmation.request_id.trim()
      : '';
  if (!yandexRequestId) {
    const error = 'A confirmed Yandex delivery request is required before saving an order.';
    console.error('[Ошибка] Невозможно сохранить заказ без подтверждения Яндекс.Доставки.');
    return { success: false, error };
  }

  try {
    // Используем транзакцию, чтобы если упадет запись товаров, сам заказ тоже не создался
    const result = await sql.begin(async (sql) => {
      const [numberCounter] = await sql<{
        order_date_code: string;
        last_number: string | number;
      }[]>`
        INSERT INTO order_number_counters (order_date, last_number)
        VALUES ((NOW() AT TIME ZONE 'Europe/Moscow')::date, 1)
        ON CONFLICT (order_date) DO UPDATE
        SET last_number = order_number_counters.last_number + 1
        RETURNING TO_CHAR(order_date, 'YYMMDD') AS order_date_code, last_number
      `;
      const orderNumber = `${numberCounter.order_date_code}-${String(numberCounter.last_number).padStart(3, '0')}`;

      // 1. Вставляем общую информацию о заказе в таблицу orders (Статус по умолчанию 'new')
      const [order] = await sql`
        INSERT INTO orders (
          order_number,
          customer_name, 
          customer_phone, 
          customer_email, 
          customer_user_id,
          delivery_platform_station_id, 
          delivery_point_address,
          customer_comment,
          delivery_price, 
          total_price,
          status,
          checkout_request_id,
          payment_method,
          payment_reference,
          yandex_operator_request_id,
          yandex_request_id,
          yandex_offers_response
        ) VALUES (
          ${orderNumber},
          ${input.customerName}, 
          ${input.customerPhone}, 
          ${input.customerEmail || null}, 
          ${input.customerUserId || null},
          ${input.deliveryPlatformStationId || null}, 
          ${input.deliveryPointAddress || null},
          ${input.customerComment || null},
          ${input.deliveryPrice}, 
          ${input.totalPrice},
          'paid',
          ${input.checkoutRequestId},
          ${input.paymentMethod},
          ${input.paymentReference},
          ${input.yandexOperatorRequestId},
          ${yandexRequestId},
          ${JSON.stringify(input.yandexOffersResponse)}::jsonb
        )
        RETURNING order_id, order_number::text AS order_number;
      `;

      // 2. Циклом записываем все товары из корзины в связующую таблицу order_items
      for (const item of input.items) {
        await sql`
          INSERT INTO order_items (
            order_id, 
            product_id, 
            selected_variant_index, 
            price_at_purchase, 
            quantity
          ) VALUES (
            ${order.order_id}, 
            ${item.productId}, 
            ${item.selectedVariantIndex}, 
            ${item.priceAtPurchase}, 
            ${item.quantity}
          );
        `;
      }

      return order;
    });

    console.log(`[Успех] Заказ #${result.order_number} успешно создан.`);
    revalidatePath('/dashboard/orders');
    return { success: true, orderId: result.order_id, orderNumber: result.order_number };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('[Ошибка] Не удалось создать заказ:', error);
    return { success: false, error: error.message || 'Ошибка при создании заказа.' };
  }
}

// ==========================================
// 2. READ (Получение данных: списки и детали)
// ==========================================

// Получение списка всех заказов с фильтрацией по статусу (для админки)
// Получение списка заказов с текстовым поиском по имени, телефону или номеру (для админки)
export async function fetchFilteredOrders(query: string): Promise<AdminOrderListItem[]> {
  try {
    const cleanQuery = query.trim();
    if (!cleanQuery) {
      return await sql<AdminOrderListItem[]>`
        SELECT
          order_id,
          order_number::text AS order_number,
          customer_name,
          customer_phone,
          total_price,
          status,
          created_at,
          COALESCE(yandex_request_id, yandex_offers_response->'confirmation'->>'request_id') AS yandex_request_id,
          yandex_offers_response->'cancellation'->>'status' AS yandex_cancellation_status,
          yandex_offers_response->'request_info' AS yandex_request_info
        FROM orders
        ORDER BY created_at DESC
      `;
    }

    // Ищем совпадения по имени, телефону или по текстовому представлению номера заказа
    return await sql<AdminOrderListItem[]>`
      SELECT
        order_id,
        order_number::text AS order_number,
        customer_name,
        customer_phone,
        total_price,
        status,
        created_at,
        COALESCE(yandex_request_id, yandex_offers_response->'confirmation'->>'request_id') AS yandex_request_id,
        yandex_offers_response->'cancellation'->>'status' AS yandex_cancellation_status,
        yandex_offers_response->'request_info' AS yandex_request_info
      FROM orders
      WHERE 
        customer_name ILIKE ${'%' + cleanQuery + '%'} OR 
        customer_phone ILIKE ${'%' + cleanQuery + '%'} OR
        order_number::text ILIKE ${'%' + cleanQuery + '%'}
      ORDER BY created_at DESC
    `;
  } catch (error) {
    console.error('[Ошибка] Не удалось получить отфильтрованный список заказов:', error);
    return [];
  }
}


// Полные детали заказа + весь список его товаров (для карточки заказа)
export async function fetchOrderDetailsById(orderId: string) {
  try {
    const [order] = await sql`SELECT * FROM orders WHERE order_id = ${orderId} LIMIT 1`;
    if (!order) return null;

    // Вытягиваем товары и сразу джойним информацию из таблицы продуктов (название, сорт), чтобы вывести в UI
    const items = await sql`
      SELECT 
        oi.*, 
        p.crop_sort, 
        p.crop_name_eng,
        p.image_src[1] as main_image
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ${orderId};
    `;

    return { ...order, items };
  } catch (error) {
    console.error('[Ошибка] Не удалось получить детали заказа:', error);
    return null;
  }
}

// ==========================================
// 3. UPDATE (Обновление полей или статуса заказа)
// ==========================================
export async function updateOrder(input: UpdateOrderInput) {
  const { orderId, ...fields } = input;
  try {
    await sql`
      UPDATE orders SET
        customer_name = ${fields.customerName ?? sql`customer_name`},
        customer_phone = ${fields.customerPhone ?? sql`customer_phone`},
        customer_email = ${fields.customerEmail ?? sql`customer_email`},
        delivery_platform_station_id = ${fields.deliveryPlatformStationId ?? sql`delivery_platform_station_id`},
        delivery_price = ${fields.deliveryPrice ?? sql`delivery_price`},
        total_price = ${fields.totalPrice ?? sql`total_price`},
        status = ${fields.status ?? sql`status`},
        updated_at = CURRENT_TIMESTAMP
      WHERE order_id = ${orderId}
    `;

    console.log(`[Успех] Заказ ${orderId} обновлен.`);
    revalidatePath('/dashboard/orders');
    revalidatePath(`/dashboard/orders/${orderId}`);
    return { success: true };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('[Ошибка] Не удалось обновить заказ:', error);
    return { success: false, error: error.message || 'Ошибка обновления заказа.' };
  }
}

// ==========================================
// 4. DELETE (Полное удаление заказа)
// ==========================================
export async function deleteOrder(orderId: string) {
  try {
    // Благодаря связи REFERENCES ... ON DELETE CASCADE в БД, 
    // при удалении заказа из таблицы orders, все его order_items удалятся автоматически!
    await sql`DELETE FROM orders WHERE order_id = ${orderId}`;
    
    console.log(`[Успех] Заказ ${orderId} полностью удален из БД.`);
    revalidatePath('/dashboard/orders');
    return { success: true };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('[Ошибка] Не удалось удалить заказ:', error);
    return { success: false, error: error.message || 'Ошибка удаления заказа.' };
  }
}


