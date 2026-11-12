// ФАЙЛ ДЛЯ СОЗДАНИЯ ТАБЛИЦ
'use server'
import { redirect } from 'next/navigation';
import postgres from 'postgres';
import { migrateOrderNumbers } from '@/app/lib/dbActions/ordersDBActions/orderNumberMigration';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

// Получение почты администратора из .env
let adminEmail: string;
  // Безопасное получение переменной окружения через try/catch
  try {
    const envEmail = process.env.ADMIN_EMAIL;
    
    // Если переменная не задана или является пустой строкой
    if (!envEmail || envEmail.trim() === "") {
      throw new Error("Переменная окружения ADMIN_EMAIL не настроена в .env файле.");
    }
    
    adminEmail = envEmail;
  } catch (error) {
    // Логируем ошибку конфигурации на сервере
    console.error("[Config Error]:", error);
    
    // Так как админский email не настроен, во избежание уязвимостей 
    // присваиваем значение, которое гарантированно не совпадет ни с одним пользователем
    adminEmail = "DISABLED_NO_ADMIN_CONFIGURED";
  }


async function getAuthorizedUser(req: Request) {
  const cookie = req.headers.get('cookie') || '';
  const match = cookie.match(/session_token=([^;]+)/);
  const token = match ? match[1] : null;
  if (!token) return null;

  const now = new Date().toISOString();
  const rows = await sql`
    SELECT u.id, u.role, u.email
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.session_token = ${token}
    AND s.expires > ${now}
    LIMIT 1
  `;
  return rows[0] || null;
}

/**
 * Инициализация таблиц заказов (orders) и состава заказов (order_items)
 * Реализует структуру статусов жизненного цикла интернет-магазина и логистику Яндекс.Доставки
 */
export async function seedOrdersAndItems(req: Request) {
  try {
    // 1. ПРОВЕРКА ПРАВ: Доступ к сидированию таблиц должен быть только у администратора
    const user = await getAuthorizedUser(req);
    
    if (!user || user.role !== 'admin' || user.email !== adminEmail) {
      console.warn(`[Security Alert]: Попытка несанкционированного сидирования таблиц заказов.`);
      return redirect('/login');
    }

    // 2. Создание UUID расширения, если оно еще не создано в этой БД
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

    console.log('Начало инициализации таблиц заказов...');

    // 3. Создание таблицы ORDERS (Общая информация о заказах)
    await sql`
    CREATE TABLE IF NOT EXISTS orders (
      -- Уникальный внутренний ID заказа для связей в БД
      order_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      
      -- Читаемый номер заказа: YYMMDD-XXX
      order_number VARCHAR(20) NOT NULL UNIQUE,
      
      -- Данные покупателя
      customer_name VARCHAR(255) NOT NULL,
      customer_phone VARCHAR(50) NOT NULL,
      customer_email VARCHAR(255),
      customer_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
      
      -- Логистические параметры Яндекс.Доставки (ПВЗ)
      delivery_platform_station_id VARCHAR(100), -- ID пункта выдачи из виджета Яндекса
      delivery_point_address TEXT,
      delivery_price DOUBLE PRECISION NOT NULL DEFAULT 0.0, -- Стоимость доставки
      customer_comment TEXT,
      
      -- Финансовые параметры
      total_price DOUBLE PRECISION NOT NULL DEFAULT 0.0, -- Итоговая сумма (Товары + Доставка)
      payment_method VARCHAR(50),
      payment_reference VARCHAR(150),
      checkout_request_id UUID,
      yandex_operator_request_id VARCHAR(100),
      yandex_request_id VARCHAR(100),
      yandex_offers_response JSONB,
      
      -- СТАТУСЫ ЗАКАЗОВ (с жестким ограничением CHECK на стороне PostgreSQL)
      status VARCHAR(50) NOT NULL DEFAULT 'new'
        CHECK (status IN (
          'new',        -- Пользователь перешел к оформлению (состав зафиксирован)
          'paid',       -- Заказ успешно оплачен (данные подтверждены)
          'processing', -- Сотрудник склада начал сборку заказа
          'ready',      -- Заказ упакован, наклеен логистический стикер доставки Яндекса
          'shipped',    -- Заказ передан курьеру / в службу доставки
          'delivered',  -- Заказ прибыл в пункт выдачи (ПВЗ) Яндекса и ждет клиента
          'recieved',   -- Заказ успешно получен клиентом лично
          'cancelled',  -- Отменено клиентом (автоматический запуск возврата товара на склад)
          'refunded'    -- Возврат средств успешно проведен клиенту на карту
        )),
        
      -- Системные временные метки
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    `;

    await migrateOrderNumbers();

    // 4. МИГРАЦИЯ ДЛЯ ORDERS: Если таблица orders уже была создана ранее, но без статусов,
    // этот блок подстрахует структуру и добавит нужные поля
    await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_platform_station_id VARCHAR(100);`;
    await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_price DOUBLE PRECISION NOT NULL DEFAULT 0.0;`;
    await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_user_id UUID REFERENCES users(id) ON DELETE SET NULL;`;
    await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_point_address TEXT;`;
    await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_comment TEXT;`;
    await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);`;
    await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_reference VARCHAR(150);`;
    await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS checkout_request_id UUID;`;
    await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS yandex_operator_request_id VARCHAR(100);`;
    await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS yandex_request_id VARCHAR(100);`;
    await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS yandex_offers_response JSONB;`;
    await sql`
      WITH request_ids AS (
        SELECT
          order_id,
          CASE
            WHEN jsonb_typeof(yandex_offers_response) = 'string'
              THEN ((yandex_offers_response #>> '{}')::jsonb)->'confirmation'->>'request_id'
            ELSE yandex_offers_response->'confirmation'->>'request_id'
          END AS request_id
        FROM orders
        WHERE yandex_request_id IS NULL
      )
      UPDATE orders AS order_row
      SET yandex_request_id = request_ids.request_id
      FROM request_ids
      WHERE order_row.order_id = request_ids.order_id
        AND NULLIF(BTRIM(request_ids.request_id), '') IS NOT NULL
    `;
    await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_checkout_request_id ON orders(checkout_request_id) WHERE checkout_request_id IS NOT NULL;`;
    await sql`CREATE INDEX IF NOT EXISTS idx_orders_customer_user_id ON orders(customer_user_id);`;

    // 5. Создание таблицы ORDER_ITEMS (Состав конкретного заказа - связь "Многие-ко-Многим")
    await sql`
    CREATE TABLE IF NOT EXISTS order_items (
      -- Уникальный ID строки состава
      item_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      
      -- Внешний ключ связи с таблицей orders (при удалении заказа — каскадно стирается его состав)
      order_id UUID REFERENCES orders(order_id) ON DELETE CASCADE NOT NULL,
      
      -- Внешний ключ связи с таблицей товаров products
      product_id VARCHAR(100) REFERENCES products(id) NOT NULL,
      
      -- Индекс фасовки (выбранный вес из package_size, необходим для расчета габаритов в Яндекс Доставке)
      selected_variant_index INT NOT NULL DEFAULT 0,
      
      -- Фиксация цены за 1 шт на момент покупки (защита от изменения цен в каталоге)
      price_at_purchase DOUBLE PRECISION NOT NULL,
      
      -- Количество купленных единиц товара
      quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0)
    );
    `;

    // 6. Создание индексов для обеспечения мгновенной скорости поиска
    await sql`CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);`;
    
    console.log('🎉 [Успех] Таблицы orders и order_items успешно созданы или обновлены.');
    return { success: true, message: 'Структура базы данных для заказов успешно развернута.' };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('❌ [Критическая ошибка сидирования заказов]:', error);
    return { success: false, error: error.message || 'Не удалось развернуть таблицы заказов.' };
  }
}

export async function GET(req: Request) {
  try {
    const user = await getAuthorizedUser(req);
    if (!user || user.role !== 'admin' || user.email !== adminEmail) {
      redirect('/forbidden'); // Вызывает внутреннее исключение Next.js
    }

    const result = await seedOrdersAndItems(req);
    if (!result.success) {
      return Response.json(result, { status: 500 });
    }

    return Response.json(result);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    // ВАЖНО: Проверяем, является ли ошибка системным редиректом Next.js
    if (error.message === 'NEXT_REDIRECT' || error.digest?.startsWith('NEXT_REDIRECT')) {
      throw error; // Пробрасываем её дальше, чтобы Next.js выполнил переход
    }

    // Обработка всех остальных реальных ошибок сидинга
    console.error("Seed route error", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

