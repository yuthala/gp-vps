'use server';

import postgres from 'postgres';
import { revalidatePath } from 'next/cache';
import { CreateOrderInput, UpdateOrderInput } from './ordersTypes';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

// ==========================================
// 1. CREATE (Создание заказа и его состава)
// ==========================================
export async function createOrder(input: CreateOrderInput) {
  try {
    // Используем транзакцию, чтобы если упадет запись товаров, сам заказ тоже не создался
    const result = await sql.begin(async (sql) => {
      
      // 1. Вставляем общую информацию о заказе в таблицу orders (Статус по умолчанию 'new')
      const [order] = await sql`
        INSERT INTO orders (
          customer_name, 
          customer_phone, 
          customer_email, 
          delivery_platform_station_id, 
          delivery_price, 
          total_price,
          status
        ) VALUES (
          ${input.customerName}, 
          ${input.customerPhone}, 
          ${input.customerEmail || null}, 
          ${input.deliveryPlatformStationId || null}, 
          ${input.deliveryPrice}, 
          ${input.totalPrice},
          'new'
        )
        RETURNING order_id, order_number;
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
export async function fetchFilteredOrders(statusQuery?: string) {
  try {
    const orders = statusQuery
      ? await sql`SELECT * FROM orders WHERE status = ${statusQuery} ORDER BY created_at DESC`
      : await sql`SELECT * FROM orders ORDER BY created_at DESC`;
    return orders;
  } catch (error) {
    console.error('[Ошибка] Не удалось получить список заказов:', error);
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
