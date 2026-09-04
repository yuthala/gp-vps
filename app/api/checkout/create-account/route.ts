import bcrypt from 'bcrypt';
import postgres from 'postgres';
import { NextResponse } from 'next/server';
import { sendCredentialsEmail } from '@/app/lib/email';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

function getRegistrationMeta(request: Request) {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const ip = forwardedFor?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || '127.0.0.1';
  const device = request.headers.get('user-agent') || 'unknown';

  return {
    registration_ip: ip,
    registration_device: device,
  };
}

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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, name, firstName, lastName, phone } = body;

    if (!email || !firstName || !lastName || !phone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await sql`
      DELETE FROM client_profiles cp
      USING users u
      WHERE cp.user_id = u.id
        AND u.date_deleted IS NOT NULL
        AND (LOWER(cp.email) = LOWER(${email}) OR cp.phone_number = ${phone})
    `;

    const fullName = (name || `${firstName} ${lastName}`.trim()).trim();

    const existingUser = await sql`
      SELECT id, is_email_verified
      FROM users
      WHERE LOWER(email) = LOWER(${email}) AND date_deleted IS NULL
      LIMIT 1
    `;

    let userId: string | null = existingUser[0]?.id ?? null;
    let generatedPassword: string | null = null;

    if (!existingUser[0]) {
      const { registration_ip, registration_device } = getRegistrationMeta(req);
      const password = generatePassword();
      const hashed = await bcrypt.hash(password, 10);
      generatedPassword = password;

      const token = genToken();
      const base = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const verifyUrl = `${base.replace(/\/$/, '')}/api/auth/verify?token=${token}`;
      const loginUrl = `${base.replace(/\/$/, '')}/login`;

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
            ${lastName},
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

      try {
        await sendCredentialsEmail(email, fullName, generatedPassword, loginUrl, verifyUrl);
      } catch (sendError) {
        console.error('Credentials email error', sendError);
      }
    }

    return NextResponse.json({ ok: true, created: Boolean(generatedPassword), userId });
  } catch (error) {
    console.error('Checkout create-account error', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
