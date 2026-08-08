import bcrypt from 'bcrypt';
import postgres from 'postgres';
import { invoices, customers, revenue, users } from '../lib/placeholder-data';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

// async function seedPersonalDataAgreements() {
//   await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
//   await sql`CREATE EXTENSION IF NOT EXISTS pgcrypto`;

//   await sql`
//       CREATE TABLE IF NOT EXISTS customerspd (
//       id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
//       first_name VARCHAR(255) NOT NULL,
//       last_name VARCHAR(255) NOT NULL,
//       email TEXT NOT NULL UNIQUE,
//       phone_number TEXT NOT NULL UNIQUE,
//       );
//   `;
// }

async function seedPersonalDataAConsents() {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  await sql`CREATE EXTENSION IF NOT EXISTS pgcrypto`;

  // // Таблица клиентов (исправлена лишняя запятая перед закрывающей скобкой)
  // await sql`
  //     CREATE TABLE IF NOT EXISTS customerspd (
  //     id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  //     first_name VARCHAR(255) NOT NULL,
  //     last_name VARCHAR(255) NOT NULL,
  //     email TEXT NOT NULL UNIQUE,
  //     phone_number TEXT NOT NULL UNIQUE
  //     );
  // `;

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


// async function seedUsers() {
//   await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
//   await sql`
//     CREATE TABLE IF NOT EXISTS users (
//       id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
//       name VARCHAR(255) NOT NULL,
//       email TEXT NOT NULL UNIQUE,
//       password TEXT NOT NULL
//     );
//   `;

//   const insertedUsers = await Promise.all(
//     users.map(async (user) => {
//       const hashedPassword = await bcrypt.hash(user.password, 10);
//       return sql`
//         INSERT INTO users (id, name, email, password)
//         VALUES (${user.id}, ${user.name}, ${user.email}, ${hashedPassword})
//         ON CONFLICT (id) DO NOTHING;
//       `;
//     }),
//   );

//   return insertedUsers;
// }

// async function seedInvoices() {
//   await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

//   await sql`
//     CREATE TABLE IF NOT EXISTS invoices (
//       id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
//       customer_id UUID NOT NULL,
//       amount INT NOT NULL,
//       status VARCHAR(255) NOT NULL,
//       date DATE NOT NULL
//     );
//   `;

//   const insertedInvoices = await Promise.all(
//     invoices.map(
//       (invoice) => sql`
//         INSERT INTO invoices (customer_id, amount, status, date)
//         VALUES (${invoice.customer_id}, ${invoice.amount}, ${invoice.status}, ${invoice.date})
//         ON CONFLICT (id) DO NOTHING;
//       `,
//     ),
//   );

//   return insertedInvoices;
// }

// async function seedCustomers() {
//   await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

//   await sql`
//     CREATE TABLE IF NOT EXISTS customers (
//       id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
//       name VARCHAR(255) NOT NULL,
//       email VARCHAR(255) NOT NULL,
//       image_url VARCHAR(255) NOT NULL
//     );
//   `;

//   const insertedCustomers = await Promise.all(
//     customers.map(
//       (customer) => sql`
//         INSERT INTO customers (id, name, email, image_url)
//         VALUES (${customer.id}, ${customer.name}, ${customer.email}, ${customer.image_url})
//         ON CONFLICT (id) DO NOTHING;
//       `,
//     ),
//   );

//   return insertedCustomers;
// }

// async function seedRevenue() {
//   await sql`
//     CREATE TABLE IF NOT EXISTS revenue (
//       month VARCHAR(4) NOT NULL UNIQUE,
//       revenue INT NOT NULL
//     );
//   `;

//   const insertedRevenue = await Promise.all(
//     revenue.map(
//       (rev) => sql`
//         INSERT INTO revenue (month, revenue)
//         VALUES (${rev.month}, ${rev.revenue})
//         ON CONFLICT (month) DO NOTHING;
//       `,
//     ),
//   );

//   return insertedRevenue;
// }

export async function GET() {
  try {
    const result = await sql.begin((sql) => [
      // seedUsers(),
      //seedCustomers()
      // seedInvoices(),
      // seedRevenue(),
      //seedPersonalDataAgreements(),
      seedPersonalDataAConsents()
    ]);

    return Response.json({ message: 'Database seeded successfully' });
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}
