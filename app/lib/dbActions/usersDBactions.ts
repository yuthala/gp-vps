'use server'
import postgres from 'postgres';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import type { ClientProfileRow } from '@/app/lib/definitions';
import type { StaffProfileRow } from '@/app/lib/definitions';
import bcrypt from 'bcrypt';
import { syncUsersTableStructure } from '@/app/(seedDB)/users-seed/route';
import { sendCredentialsEmail } from '@/app/lib/email';
import { headers } from 'next/headers'; // Используем Next.js headers API вместо req


const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

const customerPagePath = '/dashboard/customers';
const staffPagePath = '/dashboard/staff';

// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// 1. Получение меты регистрации через Next.js headers()
async function getRegistrationMeta() {
  const reqHeaders = await headers();
  const forwardedFor = reqHeaders.get('x-forwarded-for');
  const ip = forwardedFor?.split(',')[0]?.trim() || reqHeaders.get('x-real-ip') || '127.0.0.1';
  const device = reqHeaders.get('user-agent') || 'unknown';

  return {
    registration_ip: ip,
    registration_device: device,
  };
}

// 2. Служебные утилиты генерации
function generatePassword(length = 12) {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_-+=';
  let password = '';
  for (let i = 0; i < length; i += 1) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

function genToken() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { randomBytes } = require('crypto');
    return randomBytes(32).toString('hex');
  } catch {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }
}

async function ensureClientProfileTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS client_profiles (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      first_name VARCHAR(255) NOT NULL,
      second_name VARCHAR(255) NOT NULL,
      phone_number TEXT NOT NULL,
      email TEXT NOT NULL,
      bonus_balance NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
      discount_group VARCHAR(100) DEFAULT 'Standard' NOT NULL
    )
  `;
  await sql`ALTER TABLE client_profiles ADD COLUMN IF NOT EXISTS user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE;`;
  await sql`ALTER TABLE client_profiles ADD COLUMN IF NOT EXISTS first_name VARCHAR(255);`;
  await sql`ALTER TABLE client_profiles ADD COLUMN IF NOT EXISTS second_name VARCHAR(255);`;
  await sql`ALTER TABLE client_profiles ADD COLUMN IF NOT EXISTS phone_number TEXT;`;
  await sql`ALTER TABLE client_profiles ADD COLUMN IF NOT EXISTS email TEXT;`;
  await sql`ALTER TABLE client_profiles ADD COLUMN IF NOT EXISTS bonus_balance NUMERIC(10, 2) DEFAULT 0.00;`;
  await sql`ALTER TABLE client_profiles ADD COLUMN IF NOT EXISTS discount_group VARCHAR(100) DEFAULT 'Standard';`;
  await sql`ALTER TABLE client_profiles DROP COLUMN IF EXISTS date_deleted`;
  await sql`ALTER TABLE client_profiles DROP COLUMN IF EXISTS last_name`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS date_deleted TIMESTAMP WITH TIME ZONE`;
  await sql`ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_key`;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS users_active_email_key ON users (LOWER(email)) WHERE date_deleted IS NULL`;
  await sql`ALTER TABLE client_profiles DROP CONSTRAINT IF EXISTS client_profiles_email_key`;
  await sql`ALTER TABLE client_profiles DROP CONSTRAINT IF EXISTS client_profiles_phone_number_key`;
  await sql`DROP INDEX IF EXISTS client_profiles_active_email_key`;
  await sql`DROP INDEX IF EXISTS client_profiles_active_phone_key`;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS client_profiles_email_unique_idx ON client_profiles (LOWER(email))`;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS client_profiles_phone_unique_idx ON client_profiles (phone_number)`;
}

export async function getCurrentEmployeeId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('session_token')?.value;
  if (!token) return null;

  const rows = await sql<{ id: string }[]>`
    SELECT u.id
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.session_token = ${token}
      AND s.expires > NOW()
      AND u.role IN ('admin', 'staff')
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

export async function fetchClientProfile(userId: string): Promise<ClientProfileRow | null> {
  const profiles = await sql<ClientProfileRow[]>`
    SELECT cp.user_id, cp.first_name, cp.second_name, cp.email,
           cp.phone_number, cp.bonus_balance, cp.discount_group
    FROM client_profiles cp
    JOIN users u ON u.id = cp.user_id
    WHERE cp.user_id = ${userId} AND u.date_deleted IS NULL
    LIMIT 1
  `;
  return profiles[0] ?? null;
}

  export async function createClientProfile(formData: FormData) {
  try {
    // Получаем и очищаем данные из переданного объекта FormData
    const email = String(formData.get('email') || '').trim();
    const firstName = String(formData.get('first_name') || '').trim();
    const secondName = String(formData.get('second_name') || '').trim();
    const rawPhone = String(formData.get('phone_number') || '').trim();
    
    // Очищаем телефон от маски (оставляем только 11 цифр, сохраняя '7' в начале)
    const phone = rawPhone.replace(/\D/g, "");

    if (!email || !firstName || !secondName || !phone) {
      return { error: 'Не все обязательные поля заполнены' };
    }

    // Запускаем синхронизацию таблиц
    await syncUsersTableStructure();
    await ensureClientProfileTable();

    // Удаляем старые мягко-удаленные дубликаты
    await sql`
      DELETE FROM client_profiles cp
      USING users u
      WHERE cp.user_id = u.id
        AND u.date_deleted IS NOT NULL
        AND (LOWER(cp.email) = LOWER(${email}) OR cp.phone_number = ${phone})
    `;

    const fullName = `${firstName} ${secondName}`.trim();

    // Проверяем существование пользователя
    const existingUser = await sql`
      SELECT id, is_email_verified
      FROM users
      WHERE LOWER(email) = LOWER(${email}) AND date_deleted IS NULL
      LIMIT 1
    `;

    let userId: string | null = existingUser[0]?.id ?? null;
    let generatedPassword: string | null = null;

    if (!existingUser[0]) {
      const { registration_ip, registration_device } = await getRegistrationMeta();
      const password = generatePassword();
      const hashed = await bcrypt.hash(password, 10);
      generatedPassword = password;

      const token = genToken();
      const base = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const verifyUrl = `${base.replace(/\/$/, '')}/api/auth/verify?token=${token}`;
      const loginUrl = `${base.replace(/\/$/, '')}/login`;

      // Вставляем нового пользователя
      const insertResult = await sql`
        INSERT INTO users (
          role,
          email,
          password_hash,
          is_email_verified,
          email_verification_token,
          email_verified_at,
          registration_ip,
          registration_device,
          created_at
        )
        VALUES (
          'customer',
          ${email},
          ${hashed},
          false,
          ${token},
          NULL,
          ${registration_ip},
          ${registration_device},
          NOW()
        )
        RETURNING id
      `;

      userId = insertResult[0]?.id ?? null;

      if (userId) {
        // Вставляем профиль клиента
        await sql`
          INSERT INTO client_profiles (
            user_id,
            first_name,
            second_name,
            email,
            phone_number,
            bonus_balance,
            discount_group
          )
          VALUES (
            ${userId},
            ${firstName},
            ${secondName},
            ${email},
            ${phone},
            0.00,
            'Standard'
          )
          ON CONFLICT (user_id) DO UPDATE SET
            first_name = EXCLUDED.first_name,
            second_name = EXCLUDED.second_name,
            email = EXCLUDED.email,
            phone_number = EXCLUDED.phone_number
        `;
      }

      // Отправляем email
      try {
        await sendCredentialsEmail(email, fullName, generatedPassword, loginUrl, verifyUrl);
      } catch (sendError) {
        console.error('Credentials email error', sendError);
      }
    }

    // Вместо NextResponse.json возвращаем обычный объект
    revalidatePath(customerPagePath);
    return { ok: true, created: Boolean(generatedPassword), userId };

  } catch (error) {
    console.error('createClientProfile Action Error:', error);
    return { error: 'Внутренняя ошибка сервера' };
  }
}

export async function updateClientProfile(formData: FormData) {
  try {
    // 1. Извлекаем и очищаем текстовые данные
    const userId = String(formData.get('user_id') || '').trim();
    const firstName = String(formData.get('first_name') || '').trim();
    const secondName = String(formData.get('second_name') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const rawPhone = String(formData.get('phone_number') || '').trim();
    const bonusBalance = String(formData.get('bonus_balance') || '0').trim();
    const discountGroup = String(formData.get('discount_group') || 'Standard').trim();

    // Очищаем телефон от маски (оставляем только цифры для сохранения в БД)
    const phone = rawPhone.replace(/\D/g, "");

    // 2. Валидация на обязательные поля
    if (!userId || !firstName || !secondName || !email || !phone) {
      return { error: 'Не все обязательные поля заполнены корректно' };
    }

    // 3. Выполняем SQL-запрос обновления
    await sql`
      UPDATE client_profiles
      SET first_name = ${firstName},
          second_name = ${secondName},
          email = ${email},
          phone_number = ${phone},
          bonus_balance = ${bonusBalance},
          discount_group = ${discountGroup}
      WHERE user_id = ${userId}
    `;

    // 4. Инвалидируем кэш страницы (используем вашу переменную пути или строку)
    revalidatePath(customerPagePath);

    // 5. Возвращаем признак успешного выполнения для активации StatusOverlay на клиенте
    return { ok: true };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Ошибка внутри updateClientProfile:", error);
    // Возвращаем объект ошибки для активации ErrorOverlay на клиенте
    return { error: error?.message || "Не удалось обновить данные клиента" };
  }
}

/**
 * SERVER ACTION: Полное удаление профиля и мягкое удаление пользователя в транзакции
 */
export async function deleteClientProfile(formData: FormData): Promise<{ ok?: boolean; error?: string }> {
  try {
    const userId = String(formData.get('user_id') || '').trim();
    
    // Проверка на наличие ID
    if (!userId) {
      return { error: 'Идентификатор пользователя не найден или пуст' };
    }

    // Вызов функции проверки колонок аудита
    await ensureCustomerAuditColumns();

    // Выполнение операций внутри безопасной базы данных (Трансляция транзакции)
    await sql.begin(async (transaction) => {
      // 1. Полностью удаляем профиль из client_profiles
      await transaction`DELETE FROM client_profiles WHERE user_id = ${userId}`;
      
      // 2. Мягко удаляем запись в таблице users
      await transaction`UPDATE users SET date_deleted = NOW() WHERE id = ${userId} AND date_deleted IS NULL`;
    });

    // Сбрасываем кэш страницы клиентов, чтобы список мгновенно обновился в UI
    revalidatePath(customerPagePath);
    
    // КРИТИЧЕСКИ ВАЖНО: возвращаем признак успеха для активации StatusOverlay
    return { ok: true }; 

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Ошибка при транзакции удаления клиента:", error);
    // Возвращаем текст ошибки для вывода на фронтенде через ErrorOverlay
    return { error: error?.message || "Не удалось удалить клиента из базы данных" };
  }
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
      /* ИСПРАВЛЕНО: ищем роли 'staff' (вместо 'stuff') и 'admin' */
      AND u.role IN ('staff', 'admin') 
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


// export async function fetchStaffProfiles(query = ''): Promise<StaffProfileRow[]> {
//   await ensureStaffProfileTable();
//   const search = `%${query}%`;
//   const profiles = await sql<StaffProfileRow[]>`
//     SELECT sp.user_id, sp.first_name, sp.second_name, sp.email,
//            sp.phone_number, sp.position, sp.salary, sp.hire_date
//     FROM staff_profiles sp
//     JOIN users u ON u.id = sp.user_id
//     WHERE u.date_deleted IS NULL
//       AND u.role = 'staff'
//       AND (
//         sp.first_name ILIKE ${search}
//         OR sp.second_name ILIKE ${search}
//         OR sp.email ILIKE ${search}
//         OR sp.phone_number ILIKE ${search}
//         OR sp.position ILIKE ${search}
//       )
//     ORDER BY sp.second_name ASC, sp.first_name ASC
//   `;

//   const employeeId = await getCurrentEmployeeId();
//   if (employeeId && profiles.length > 0) {
//     const staffIds = profiles.map((profile) => profile.user_id);
//     await sql`
//       INSERT INTO pd_access_logs (employee_id, customer_id, action_type, accessed_at)
//       SELECT ${employeeId}, u.id, 'SELECT', NOW()
//       FROM users u
//       WHERE u.id = ANY(${sql.array(staffIds)}::uuid[])
//     `;
//   }

//   return profiles;
// }

export async function fetchStaffProfile(userId: string): Promise<StaffProfileRow | null> {
  const profiles = await sql<StaffProfileRow[]>`
    SELECT sp.user_id, sp.first_name, sp.second_name, sp.email,
           sp.phone_number, sp.position, sp.salary, sp.hire_date
    FROM staff_profiles sp
    JOIN users u ON u.id = sp.user_id
    WHERE sp.user_id = ${userId} AND u.date_deleted IS NULL
    LIMIT 1
  `;
  return profiles[0] ?? null;
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


/**
 * SERVER ACTION: Создание аккаунта сотрудника с отправкой письма верификации
 */
export async function createStaffProfile(formData: FormData): Promise<{ ok?: boolean; error?: string }> {
  try {
    // Извлекаем и очищаем данные из формы
    const role = String(formData.get('role') || 'staff').trim();
    const firstName = String(formData.get('first_name') || '').trim();
    const secondName = String(formData.get('second_name') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const rawPhone = String(formData.get('phone_number') || '').trim();
    const position = String(formData.get('position') || '').trim();
    const salary = String(formData.get('salary') || '0').trim();
    const hireDate = String(formData.get('hire_date') || '').trim();

    // Очищаем телефон от маски
    const phoneNumber = rawPhone.replace(/\D/g, "");

    // Валидация полей
    if (!firstName || !secondName || !email || !phoneNumber || !position || !salary) {
      return { error: 'Не все обязательные поля заполнены' };
    }

    // Подготовка значения даты во избежание ошибки сопоставления типов COALESCE в Postgres
    const finalHireDate = hireDate ? hireDate : new Date().toISOString().slice(0, 10);

    await ensureStaffProfileTable();

    // Проверяем, существует ли уже активный пользователь с таким email
    const existingUser = await sql`
      SELECT id 
      FROM users 
      WHERE LOWER(email) = LOWER(${email}) AND date_deleted IS NULL 
      LIMIT 1
    `;

    if (existingUser[0]) {
      return { error: 'Пользователь с таким E-mail уже зарегистрирован в системе' };
    }

    // Собираем метаданные регистрации
    const { registration_ip, registration_device } = await getRegistrationMeta();
    
    // Генерируем пароль, хэш и токен
    const password = generatePassword();
    const hashed = await bcrypt.hash(password, 10);
    const token = genToken();

    // Формируем ссылки для отправки письма
    const base = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const verifyUrl = `${base.replace(/\/$/, '')}/api/auth/verify?token=${token}`;
    const loginUrl = `${base.replace(/\/$/, '')}/login`;
    const fullName = `${firstName} ${secondName}`.trim();

    // Запускаем атомарную транзакцию
    await sql.begin(async (transaction) => {
      
      // 1. Вставка в таблицу users (is_email_verified устанавливается в false, передаем токен)
      const insertUserResult = await transaction`
        INSERT INTO users (
          role,
          email,
          password_hash,
          is_email_verified,
          email_verification_token,
          email_verified_at,
          registration_ip,
          registration_device,
          created_at
        )
        VALUES (
          ${role},
          ${email},
          ${hashed},
          false,
          ${token},
          NULL,
          ${registration_ip},
          ${registration_device},
          NOW()
        )
        RETURNING id
      `;

      const generatedUserId = insertUserResult[0]?.id;
      if (!generatedUserId) {
        throw new Error('Не удалось создать учетную запись пользователя');
      }

      // 2. Вставка в таблицу staff_profiles с явным приведением даты ::date
      await transaction`
        INSERT INTO staff_profiles (
          user_id,
          first_name,
          second_name,
          email,
          phone_number,
          position,
          salary,
          hire_date
        )
        VALUES (
          ${generatedUserId},
          ${firstName},
          ${secondName},
          ${email},
          ${phoneNumber},
          ${position},
          ${salary},
          ${finalHireDate}::date
        )
      `;
    });

    // 3. Отправляем письмо с данными и ссылкой на верификацию после успешной транзакции
    try {
      await sendCredentialsEmail(email, fullName, password, loginUrl, verifyUrl);
    } catch (sendError) {
      console.error('Ошибка отправки письма сотруднику:', sendError);
      // Не прерываем выполнение, так как запись в БД уже создана
    }

    // Сбрасываем кэш роута сотрудников
    revalidatePath(staffPagePath);

    return { ok: true };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Ошибка при создании сотрудника:", error);
    return { error: error?.message || "Внутренняя ошибка сервера при создании сотрудника" };
  }
}