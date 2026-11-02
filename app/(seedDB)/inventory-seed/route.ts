// ФАЙЛ ДЛЯ СОЗДАНИЯ И РАБОТЫ С ТАБЛИЦЕЙ INVENTORY (ОСТАТКИ НА СКЛАДАХ)

'use server';
import postgres from 'postgres';
import { redirect } from 'next/navigation';

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

export async function createInventoryTable() {
    // 1. Создание таблицы остатков на складах с типами данных под ваши требования
    await sql`
    CREATE TABLE IF NOT EXISTS inventory (
      -- Системный ID записи (генерируется автоматически)
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      
      -- product_id: string - Артикул товара (SKU)
      product_id VARCHAR(100) NOT NULL,
      
      -- quantity: int - Количество товара на складе (не может быть отрицательным)
      quantity INT NOT NULL DEFAULT 0 CHECK (quantity >= 0),
      
      -- warehouse_id: string - ID или код склада
      warehouse_id VARCHAR(100) NOT NULL,
      
      -- last_updated: дата и время последнего изменения остатка
      last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

      -- Ограничение: один и тот же товар не может дублироваться на одном и том же складе
      CONSTRAINT unique_product_warehouse UNIQUE (product_id, warehouse_id)
    );
    `;

    // 2. Создание индексов для быстрого поиска остатков по товару и по складу
    await sql`CREATE INDEX IF NOT EXISTS idx_inventory_product ON inventory(product_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_inventory_warehouse ON inventory(warehouse_id);`;
    
    console.log('Таблица inventory успешно создана или уже существует.');
}

export async function GET(req: Request) {
  try {
    const user = await getAuthorizedUser(req);
    if (!user || user.email !== adminEmail) {
      redirect('/forbidden'); // Вызывает внутреннее исключение Next.js
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const result = await sql.begin(() => [ // убрал аргумент sql из функции sql.begin(sql) 
     createInventoryTable()
    ]);

    return Response.json({ success: true });
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