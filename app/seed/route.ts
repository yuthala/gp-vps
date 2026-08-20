'use server'
import postgres from 'postgres';
import { NextResponse } from 'next/server';
import { invoices, customers, revenue, users } from '../lib/placeholder-data';
import bcrypt from 'bcrypt'
import { forbiddenPage } from '../user-dashboard/forbidden-page';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

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
    SELECT u.id, u.name, u.email
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.session_token = ${token}
    AND s.expires > ${now}
    LIMIT 1
  `;
  return rows[0] || null;
}

async function seedPersonalDataAgreements() {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  await sql`CREATE EXTENSION IF NOT EXISTS pgcrypto`;

  await sql`
      CREATE TABLE IF NOT EXISTS customerspd (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      first_name VARCHAR(255) NOT NULL,
      last_name VARCHAR(255) NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone_number TEXT NOT NULL UNIQUE,
      );
  `;
}

async function seedProducts() {
    // 1. Создание в БД алгоритмов UUID (если еще не созданы)
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

    // 2. Создание таблицы товаров с типами данных под ваши требования
    await sql`
    CREATE TABLE IF NOT EXISTS products (
      -- Внутренний системный ID (генерируется автоматически)
      internal_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      
      -- sku_id: string - Артикул (SKU). Делаем его UNIQUE, так как артикулы не должны повторяться
      id VARCHAR(100) NOT NULL UNIQUE,
      
      -- imageSrc: array string - Ссылки на картинки из S3 sweb.ru (используем массив TEXT[])
      image_src TEXT[] NOT NULL DEFAULT '{}',
      
      -- description: string
      description TEXT NOT NULL,
      
      -- descriptionDetails: string
      description_details TEXT,
      
      -- cropSort: string
      crop_sort VARCHAR(255),
      
      -- cropNameEng: string
      crop_name_eng VARCHAR(255) NOT NULL,
      
      -- tags: array string - Массив текстовых тегов (например, ['топ', 'новинка'])
      tags TEXT[] DEFAULT '{}',
      
      -- packageSize: array double - Массив дробных чисел (в Postgres это DOUBLE PRECISION[])
      package_size DOUBLE PRECISION[] DEFAULT '{}',
      
      -- cropSize: string
      crop_size VARCHAR(100),
      
      -- pathNameEng: string (часто используется для ЧПУ URL, например /catalog/tomato-red)
      path_name_eng VARCHAR(255) NOT NULL UNIQUE,
      
      -- onStockStatus: string (ограничиваем возможные статусы для безопасности)
      on_stock_status VARCHAR(50) NOT NULL DEFAULT 'out_of_stock' 
        CHECK (on_stock_status IN ('in_stock', 'out_of_stock', 'pre_order')),
      
      -- price: double - Цена товара (для денег лучше использовать NUMERIC, но под double подходит DOUBLE PRECISION)
      price DOUBLE PRECISION NOT NULL DEFAULT 0.0,
      
      -- measureUnit: int - ID единицы измерения (например: 1 - шт, 2 - кг, 3 - гр)
      measure_unit INT NOT NULL DEFAULT 1,
      
      -- estimatedOnStockDate: string - Дата ожидаемого поступления (используем тип DATE или TIMESTAMP)
      estimated_on_stock_date DATE,
      
      -- Системные поля даты создания и обновления (полезно для любого магазина)
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    `;

    // 3. Создаем индексы для мгновенного поиска по артикулу и по URL-пути
    await sql`CREATE INDEX IF NOT EXISTS idx_products_sku ON products(id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_products_path ON products(path_name_eng);`;
    
    console.log('Таблица products успешно создана или уже существует.');
}


async function seedPersonalDataAConsents() {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  await sql`CREATE EXTENSION IF NOT EXISTS pgcrypto`;

  // Таблица клиентов (исправлена лишняя запятая перед закрывающей скобкой)
  await sql`
      CREATE TABLE IF NOT EXISTS customerspd (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      first_name VARCHAR(255) NOT NULL,
      last_name VARCHAR(255) NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone_number TEXT NOT NULL UNIQUE
      );
  `;

  // Таблица фиксации согласий клиентов (Доказательная база для Роскомнадзора)
  await sql`
      CREATE TABLE IF NOT EXISTS consent_logs (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      customer_id UUID REFERENCES customerspd(id) ON DELETE CASCADE,
      consent_type VARCHAR(50) NOT NULL,
      version_agreed VARCHAR(10) NOT NULL,
      ip_address INET NOT NULL,
      signed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
  `;

  // Таблица логирования доступа сотрудников к ПД (Требование ФСТЭК по аудиту)
  await sql`
      CREATE TABLE IF NOT EXISTS pd_access_logs (
      id BIGSERIAL PRIMARY KEY,
      employee_id UUID NOT NULL,
      customer_id UUID REFERENCES customerspd(id) ON DELETE SET NULL,
      action_type VARCHAR(20) NOT NULL,
      accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
  `;
}


async function seedUsers() {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    );
  `;

  const insertedUsers = await Promise.all(
    users.map(async (user) => {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      return sql`
        INSERT INTO users (id, name, email, password)
        VALUES (${user.id}, ${user.name}, ${user.email}, ${hashedPassword})
        ON CONFLICT (id) DO NOTHING;
      `;
    }),
  );

  return insertedUsers;
}

// Создание в БД таблицы "Invoices"
async function seedInvoices() {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  await sql`
    CREATE TABLE IF NOT EXISTS invoices (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      customer_id UUID NOT NULL,
      amount INT NOT NULL,
      status VARCHAR(255) NOT NULL,
      date DATE NOT NULL
    );
  `;

  const insertedInvoices = await Promise.all(
    invoices.map(
      (invoice) => sql`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (${invoice.customer_id}, ${invoice.amount}, ${invoice.status}, ${invoice.date})
        ON CONFLICT (id) DO NOTHING;
      `,
    ),
  );

  return insertedInvoices;
}

async function seedCustomers() {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  await sql`
    CREATE TABLE IF NOT EXISTS customers (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      image_url VARCHAR(255) NOT NULL
    );
  `;

  const insertedCustomers = await Promise.all(
    customers.map(
      (customer) => sql`
        INSERT INTO customers (id, name, email, image_url)
        VALUES (${customer.id}, ${customer.name}, ${customer.email}, ${customer.image_url})
        ON CONFLICT (id) DO NOTHING;
      `,
    ),
  );

  return insertedCustomers;
}

async function seedRevenue() {
  await sql`
    CREATE TABLE IF NOT EXISTS revenue (
      month VARCHAR(4) NOT NULL UNIQUE,
      revenue INT NOT NULL
    );
  `;

  const insertedRevenue = await Promise.all(
    revenue.map(
      (rev) => sql`
        INSERT INTO revenue (month, revenue)
        VALUES (${rev.month}, ${rev.revenue})
        ON CONFLICT (month) DO NOTHING;
      `,
    ),
  );

  return insertedRevenue;
}



export async function GET(req: Request) {
  try {
    const user = await getAuthorizedUser(req);
    if (!user || user.email !== adminEmail) {
      return forbiddenPage();
    }

    const result = await sql.begin((sql) => [
      seedUsers(),
      seedCustomers(),
      seedInvoices(),
      seedRevenue(),
      seedPersonalDataAgreements(),
      seedPersonalDataAConsents(),
      seedProducts()
    ]);

    return Response.json({ message: 'Database seeded successfully' });
  } catch (error) {
    console.error('Seed route error', error);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}
