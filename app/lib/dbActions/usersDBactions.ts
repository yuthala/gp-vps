'use server'
import postgres from 'postgres';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import type { ClientProfileRow } from '@/app/lib/definitions';
import type { StaffProfileRow } from '@/app/lib/definitions';


const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

const customerPagePath = '/dashboard/customers';
const staffPagePath = '/dashboard/stuff';

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