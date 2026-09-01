'use server'
import postgres from 'postgres';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export type ClientProfileRow = {
  user_id: string;
  first_name: string;
  second_name: string;
  email: string;
  phone_number: string;
  bonus_balance: string;
  discount_group: string;
};

const customerPagePath = '/dashboard/customers';
const staffPagePath = '/dashboard/stuff';

export type StaffProfileRow = {
  user_id: string;
  first_name: string;
  second_name: string;
  email: string;
  phone_number: string;
  position: string;
  salary: string;
  hire_date: Date;
};

async function getCurrentEmployeeId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('session_token')?.value;
  if (!token) return null;

  const rows = await sql<{ id: string }[]>`
    SELECT u.id
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.session_token = ${token}
      AND s.expires > NOW()
      AND u.role IN ('admin', 'stuff')
    LIMIT 1
  `;

  return rows[0]?.id ?? null;
}

async function ensureCustomerAuditColumns() {
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS date_deleted TIMESTAMP WITH TIME ZONE`;
  await sql`ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_key`;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS users_active_email_key ON users (LOWER(email)) WHERE date_deleted IS NULL`;
  await sql`ALTER TABLE client_profiles DROP COLUMN IF EXISTS date_deleted`;
  await sql`ALTER TABLE client_profiles DROP COLUMN IF EXISTS last_name`;
  await sql`ALTER TABLE client_profiles DROP CONSTRAINT IF EXISTS client_profiles_email_key`;
  await sql`ALTER TABLE client_profiles DROP CONSTRAINT IF EXISTS client_profiles_phone_number_key`;
  await sql`DROP INDEX IF EXISTS client_profiles_active_email_key`;
  await sql`DROP INDEX IF EXISTS client_profiles_active_phone_key`;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS client_profiles_email_unique_idx ON client_profiles (LOWER(email))`;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS client_profiles_phone_unique_idx ON client_profiles (phone_number)`;
  await sql`
    CREATE TABLE IF NOT EXISTS pd_access_logs (
      id BIGSERIAL PRIMARY KEY,
      employee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      action_type VARCHAR(20) NOT NULL,
      accessed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
    )
  `;
  await sql`ALTER TABLE pd_access_logs ADD COLUMN IF NOT EXISTS accessed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP`;
  await sql`ALTER TABLE pd_access_logs ADD COLUMN IF NOT EXISTS action_type VARCHAR(20)`;
  await sql`ALTER TABLE pd_access_logs DROP CONSTRAINT IF EXISTS pd_access_logs_customer_id_fkey`;
  await sql`
    DO $$ BEGIN
      ALTER TABLE pd_access_logs
        ADD CONSTRAINT pd_access_logs_customer_id_fkey
        FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `;
}

export async function fetchClientProfiles(query = ''): Promise<ClientProfileRow[]> {
  await ensureCustomerAuditColumns();
  const search = `%${query}%`;
  const profiles = await sql<ClientProfileRow[]>`
    SELECT
      cp.user_id,
      cp.first_name,
      cp.second_name,
      cp.email,
      cp.phone_number,
      cp.bonus_balance,
      cp.discount_group
    FROM client_profiles cp
    JOIN users u ON u.id = cp.user_id
    WHERE u.date_deleted IS NULL
      AND (
        cp.first_name ILIKE ${search}
        OR cp.second_name ILIKE ${search}
        OR cp.email ILIKE ${search}
        OR cp.phone_number ILIKE ${search}
      )
    ORDER BY cp.second_name ASC, cp.first_name ASC
  `;

  const employeeId = await getCurrentEmployeeId();
  if (employeeId && profiles.length > 0) {
    const customerIds = profiles.map((profile) => profile.user_id);
    await sql`
      INSERT INTO pd_access_logs (employee_id, customer_id, action_type, accessed_at)
      SELECT ${employeeId}, u.id, 'SELECT', NOW()
      FROM users u
      WHERE u.id = ANY(${sql.array(customerIds)}::uuid[])
    `;
  }

  return profiles;
}

export async function createClientProfile(formData: FormData) {
  const userId = String(formData.get('user_id') || '').trim();
  const firstName = String(formData.get('first_name') || '').trim();
  const secondName = String(formData.get('second_name') || '').trim();
  const email = String(formData.get('email') || '').trim();
  const phoneNumber = String(formData.get('phone_number') || '').trim();

  if (!userId || !firstName || !secondName || !email || !phoneNumber) return;

  await sql`
    INSERT INTO client_profiles (user_id, first_name, second_name, email, phone_number)
    SELECT ${userId}, ${firstName}, ${secondName}, ${email}, ${phoneNumber}
    WHERE EXISTS (SELECT 1 FROM users WHERE id = ${userId} AND role = 'customer' AND date_deleted IS NULL)
  `;
  revalidatePath(customerPagePath);
}

export async function updateClientProfile(formData: FormData) {
  const userId = String(formData.get('user_id') || '').trim();
  const firstName = String(formData.get('first_name') || '').trim();
  const secondName = String(formData.get('second_name') || '').trim();
  const email = String(formData.get('email') || '').trim();
  const phoneNumber = String(formData.get('phone_number') || '').trim();
  const bonusBalance = String(formData.get('bonus_balance') || '0').trim();
  const discountGroup = String(formData.get('discount_group') || 'Standard').trim();

  if (!userId || !firstName || !secondName || !email || !phoneNumber) return;

  await sql`
    UPDATE client_profiles
    SET first_name = ${firstName},
        second_name = ${secondName},
        email = ${email},
        phone_number = ${phoneNumber},
        bonus_balance = ${bonusBalance},
        discount_group = ${discountGroup}
    WHERE user_id = ${userId}
  `;
  revalidatePath(customerPagePath);
}

export async function deleteClientProfile(formData: FormData) {
  const userId = String(formData.get('user_id') || '').trim();
  if (!userId) return;

  await ensureCustomerAuditColumns();
  await sql.begin(async (transaction) => {
    await transaction`DELETE FROM client_profiles WHERE user_id = ${userId}`;
    await transaction`UPDATE users SET date_deleted = NOW() WHERE id = ${userId} AND date_deleted IS NULL`;
  });
  revalidatePath(customerPagePath);
}

async function ensureStaffProfileTable() {
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS date_deleted TIMESTAMP WITH TIME ZONE`;
  await sql`
    CREATE TABLE IF NOT EXISTS staff_profiles (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      first_name VARCHAR(255) NOT NULL,
      second_name VARCHAR(255) NOT NULL,
      phone_number TEXT NOT NULL,
      email TEXT NOT NULL,
      position VARCHAR(255) NOT NULL,
      salary NUMERIC(12, 2) NOT NULL,
      hire_date DATE DEFAULT CURRENT_DATE NOT NULL
    )
  `;
  await sql`ALTER TABLE staff_profiles DROP CONSTRAINT IF EXISTS staff_profiles_email_key`;
  await sql`ALTER TABLE staff_profiles DROP CONSTRAINT IF EXISTS staff_profiles_phone_number_key`;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS staff_profiles_email_unique_idx ON staff_profiles (LOWER(email))`;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS staff_profiles_phone_unique_idx ON staff_profiles (phone_number)`;
}

export async function fetchStaffProfiles(query = ''): Promise<StaffProfileRow[]> {
  await ensureStaffProfileTable();
  const search = `%${query}%`;
  const profiles = await sql<StaffProfileRow[]>`
    SELECT sp.user_id, sp.first_name, sp.second_name, sp.email,
           sp.phone_number, sp.position, sp.salary, sp.hire_date
    FROM staff_profiles sp
    JOIN users u ON u.id = sp.user_id
    WHERE u.date_deleted IS NULL
      AND u.role = 'stuff'
      AND (
        sp.first_name ILIKE ${search}
        OR sp.second_name ILIKE ${search}
        OR sp.email ILIKE ${search}
        OR sp.phone_number ILIKE ${search}
        OR sp.position ILIKE ${search}
      )
    ORDER BY sp.second_name ASC, sp.first_name ASC
  `;

  const employeeId = await getCurrentEmployeeId();
  if (employeeId && profiles.length > 0) {
    const staffIds = profiles.map((profile) => profile.user_id);
    await sql`
      INSERT INTO pd_access_logs (employee_id, customer_id, action_type, accessed_at)
      SELECT ${employeeId}, u.id, 'SELECT', NOW()
      FROM users u
      WHERE u.id = ANY(${sql.array(staffIds)}::uuid[])
    `;
  }

  return profiles;
}

export async function createStaffProfile(formData: FormData) {
  const userId = String(formData.get('user_id') || '').trim();
  const firstName = String(formData.get('first_name') || '').trim();
  const secondName = String(formData.get('second_name') || '').trim();
  const email = String(formData.get('email') || '').trim();
  const phoneNumber = String(formData.get('phone_number') || '').trim();
  const position = String(formData.get('position') || '').trim();
  const salary = String(formData.get('salary') || '0').trim();
  const hireDate = String(formData.get('hire_date') || '').trim();

  if (!userId || !firstName || !secondName || !email || !phoneNumber || !position || !salary) return;
  await ensureStaffProfileTable();

  await sql`
    INSERT INTO staff_profiles (user_id, first_name, second_name, email, phone_number, position, salary, hire_date)
    SELECT ${userId}, ${firstName}, ${secondName}, ${email}, ${phoneNumber}, ${position}, ${salary}, COALESCE(NULLIF(${hireDate}, ''), CURRENT_DATE)
    WHERE EXISTS (SELECT 1 FROM users WHERE id = ${userId} AND role = 'stuff' AND date_deleted IS NULL)
  `;
  revalidatePath(staffPagePath);
}

export async function updateStaffProfile(formData: FormData) {
  const userId = String(formData.get('user_id') || '').trim();
  const firstName = String(formData.get('first_name') || '').trim();
  const secondName = String(formData.get('second_name') || '').trim();
  const email = String(formData.get('email') || '').trim();
  const phoneNumber = String(formData.get('phone_number') || '').trim();
  const position = String(formData.get('position') || '').trim();
  const salary = String(formData.get('salary') || '0').trim();
  const hireDate = String(formData.get('hire_date') || '').trim();

  if (!userId || !firstName || !secondName || !email || !phoneNumber || !position || !salary || !hireDate) return;
  await sql`
    UPDATE staff_profiles
    SET first_name = ${firstName}, second_name = ${secondName}, email = ${email},
        phone_number = ${phoneNumber}, position = ${position}, salary = ${salary},
        hire_date = ${hireDate}
    WHERE user_id = ${userId}
  `;
  revalidatePath(staffPagePath);
}

export async function deleteStaffProfile(formData: FormData) {
  const userId = String(formData.get('user_id') || '').trim();
  if (!userId) return;
  await ensureStaffProfileTable();
  await sql.begin(async (transaction) => {
    await transaction`DELETE FROM staff_profiles WHERE user_id = ${userId}`;
    await transaction`UPDATE users SET date_deleted = NOW() WHERE id = ${userId} AND date_deleted IS NULL`;
  });
  revalidatePath(staffPagePath);
}

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

  //ПОЛУЧЕНИЕ АВТОРИЗОВАННОГО ПОЛЬЗОВАТЕЛЯ
//   async function getAuthorizedUser(req: Request) {
//   const cookie = req.headers.get('cookie') || '';
//   const match = cookie.match(/session_token=([^;]+)/);
//   const token = match ? match[1] : null;
//   if (!token) return null;

//   const now = new Date().toISOString();
//   const rows = await sql`
//     SELECT u.id, u.name, u.email
//     FROM sessions s
//     JOIN users u ON u.id = s.user_id
//     WHERE s.session_token = ${token}
//     AND s.expires > ${now}
//     LIMIT 1
//   `;
//   return rows[0] || null;
// }
// Описываем структуру объекта, который возвращает база данных
interface AuthorizedUser {
  id: string;
  role: 'admin' | 'stuff' | 'customer';
  email: string;
}

async function getAuthorizedUser(req: Request): Promise<AuthorizedUser | null> {
  const cookie = req.headers.get('cookie') || '';
  const match = cookie.match(/session_token=([^;]+)/);
  const token = match ? match[1] : null;
  if (!token) return null;

  // Для работы с TIMESTAMP WITH TIME ZONE лучше передавать объект Date напрямую, 
  // драйвер postgres сам преобразует его в нужный формат.
  const now = new Date();

  const rows = await sql<AuthorizedUser[]>`
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
 * Инициализация или принудительное обновление структуры таблицы users под требования UserEntity
 */
export async function syncUsersTableStructure(): Promise<void> {
  // Гарантируем наличие расширения для UUID
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  // Гарантируем наличие перечисления ENUM в схеме базы данных
  await sql`
    DO $$ BEGIN
      CREATE TYPE user_role AS ENUM ('admin', 'stuff', 'customer');
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;
  `;

  // Создаем или проверяем актуальность таблицы users
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      role user_role NOT NULL DEFAULT 'customer',
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      is_email_verified BOOLEAN NOT NULL DEFAULT FALSE,
      email_verification_token TEXT,
      email_verified_at TIMESTAMP WITH TIME ZONE,
      registration_ip INET,
      registration_device TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      date_deleted TIMESTAMP WITH TIME ZONE
    );
  `;

  // Накатываем изменения деструктивно, если таблица существовала в старом формате
  await sql`ALTER TABLE users DROP COLUMN IF EXISTS name;`;
  
  await sql`
    ALTER TABLE users 
    ADD COLUMN IF NOT EXISTS role user_role NOT NULL DEFAULT 'customer',
    ADD COLUMN IF NOT EXISTS registration_ip INET,
    ADD COLUMN IF NOT EXISTS registration_device TEXT,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    ADD COLUMN IF NOT EXISTS date_deleted TIMESTAMP WITH TIME ZONE;
  `;
  await sql`ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_key`;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS users_active_email_key ON users (LOWER(email)) WHERE date_deleted IS NULL`;

  console.log("🚀 [БД]: Таблица users успешно синхронизирована с интерфейсом UserEntity.");
}

/*
СОЗДАНИЕ ПРОФИЛЕЙ КЛИЕНТОВ
 */
async function seedClientProfiles() {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  await sql`CREATE EXTENSION IF NOT EXISTS pgcrypto`;

  await sql`
      CREATE TABLE IF NOT EXISTS client_profiles (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      first_name VARCHAR(255) NOT NULL,
      second_name VARCHAR(255) NOT NULL,
      phone_number TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      bonus_balance NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
      discount_group VARCHAR(100) DEFAULT 'Standard' NOT NULL
      );
  `;
  await sql`ALTER TABLE client_profiles DROP COLUMN IF EXISTS date_deleted`;
  await sql`ALTER TABLE client_profiles DROP COLUMN IF EXISTS last_name`;
  await sql`ALTER TABLE client_profiles DROP CONSTRAINT IF EXISTS client_profiles_email_key`;
  await sql`ALTER TABLE client_profiles DROP CONSTRAINT IF EXISTS client_profiles_phone_number_key`;
  await sql`DROP INDEX IF EXISTS client_profiles_active_email_key`;
  await sql`DROP INDEX IF EXISTS client_profiles_active_phone_key`;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS client_profiles_email_unique_idx ON client_profiles (LOWER(email))`;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS client_profiles_phone_unique_idx ON client_profiles (phone_number)`;
}

/*
СОЗДАНИЕ ПРОФИЛЕЙ СОТРУДНИКОВ
 */
async function seedStaffProfiles() {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  await sql`CREATE EXTENSION IF NOT EXISTS pgcrypto`;

  await sql`
      CREATE TABLE IF NOT EXISTS staff_profiles (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      first_name VARCHAR(255) NOT NULL,
      second_name VARCHAR(255) NOT NULL,
      phone_number TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      position VARCHAR(255) NOT NULL,
      salary NUMERIC(12, 2) NOT NULL,
      hire_date DATE DEFAULT CURRENT_DATE NOT NULL
      );
  `;
}

/* СОЗДАНИЕ ТАБЛИЦЫ customerspd */
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
      customer_id UUID REFERENCES users(id) ON DELETE CASCADE,
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


export async function GET(req: Request) {
  try {
    const user = await getAuthorizedUser(req);
    if (!user || user.email !== adminEmail) {
      redirect('/forbidden'); // Вызывает внутреннее исключение Next.js
    }

    await sql.begin(() => [ // убрал аргумент sql из функции sql.begin(sql) 
     syncUsersTableStructure(),
     seedClientProfiles(),
     seedStaffProfiles(),
     seedPersonalDataAConsents(),
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

// export async function GET(req: Request) {
//   try {
//      const user = await getAuthorizedUser(req);
//     if (!user || user.email  !== adminEmail) {
//       //return forbiddenPage();
//       redirect('/forbidden');
//     }
    
//     const result = await sql.begin(() => [ // убрал аргумент sql из функции sql.begin(sql) 
//      syncUsersTableStructure()
//     ]);

//     return Response.json({ message: 'Database seeded successfully', result });
//   } catch (error) {
//     console.error('Seed route error', error);
//     return Response.json({ error: 'Server error' }, { status: 500 });
//   }
// }