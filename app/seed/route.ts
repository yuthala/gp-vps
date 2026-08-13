import postgres from 'postgres';
import { NextResponse } from 'next/server';
import { invoices, customers, revenue, users } from '../lib/placeholder-data';
import bcrypt from 'bcrypt'

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

const ADMIN_EMAIL = 'sales@greenpato.ru';

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

function forbiddenPage() {
  const html = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Доступ запрещён</title>
  <style>
    :root {
      font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      color: #064929;
      background: #F2F9ED;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      background: linear-gradient(180deg, #F2F9ED 0%, #FFFFFF 100%);
    }

    .page {
      width: min(100%, 680px);
      padding: 32px;
      background: #FFFFFF;
      border: 1px solid rgba(6, 73, 41, 0.12);
      border-radius: 30px;
      box-shadow: 0 32px 80px rgba(6, 73, 41, 0.08);
    }

    .label {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      font-size: 0.85rem;
      font-weight: 700;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: #40AD52;
      margin-bottom: 24px;
    }

    .label::before {
      content: "";
      width: 12px;
      height: 12px;
      border-radius: 999px;
      background: #40AD52;
    }

    h1 {
      margin: 0;
      font-size: clamp(2rem, 4vw, 3rem);
      line-height: 1.05;
      color: #064929;
    }

    p {
      margin: 24px 0 32px;
      line-height: 1.8;
      color: #334155;
      font-size: 1rem;
    }

    strong {
      color: #064929;
    }

    .button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 14px 24px;
      border-radius: 999px;
      background: #40AD52;
      color: #FFFFFF;
      font-weight: 700;
      text-decoration: none;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
      box-shadow: 0 18px 30px rgba(64, 173, 82, 0.24);
    }

    .button:hover {
      transform: translateY(-1px);
      box-shadow: 0 22px 34px rgba(64, 173, 82, 0.28);
    }

    .hint {
      margin-top: 20px;
      color: #64748B;
      font-size: 0.95rem;
    }

    @media (max-width: 640px) {
      .page {
        padding: 24px;
      }
      h1 {
        font-size: 2.2rem;
      }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="label">Доступ запрещён</div>
    <h1>Эта страница доступна только для авторизованных пользователей.</h1>
    <p>Пожалуйста, войдите в систему с разрешённым аккаунтом или вернитесь на главную страницу.</p>
    <a class="button" href="/">Вернуться на главную</a>
  </div>
</body>
</html>`;

  return new Response(html, {
    status: 403,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

export async function GET(req: Request) {
  try {
    const user = await getAuthorizedUser(req);
    if (!user || user.email !== ADMIN_EMAIL) {
      return forbiddenPage();
    }

    const result = await sql.begin((sql) => [
      seedUsers(),
      seedCustomers(),
      seedInvoices(),
      seedRevenue(),
      seedPersonalDataAgreements(),
      seedPersonalDataAConsents()
    ]);

    return Response.json({ message: 'Database seeded successfully' });
  } catch (error) {
    console.error('Seed route error', error);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}
