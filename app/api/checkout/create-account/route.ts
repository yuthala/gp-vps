import bcrypt from 'bcrypt';
import postgres from 'postgres';
import { NextResponse } from 'next/server';
import { sendCredentialsEmail } from '@/app/lib/email';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

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
  } catch (e) {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, name } = body;
    if (!email || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const rows = await sql`
      SELECT id, email_verified
      FROM users
      WHERE email = ${email}
      LIMIT 1
    `;

    const user = rows[0];
    let userId: string;
    let generatedPassword: string | null = null;

    if (user) {
      userId = user.id;
    } else {
      const password = generatePassword();
      const hashed = await bcrypt.hash(password, 10);
      generatedPassword = password;

      const result = await sql`
        INSERT INTO users (name, email, password, email_verified)
        VALUES (${name}, ${email}, ${hashed}, true)
        RETURNING id
      `;

      userId = result[0].id;
    }

    if (generatedPassword) {
      const base = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const loginUrl = `${base.replace(/\/$/, '')}/login-page`;
      try {
        await sendCredentialsEmail(email, name, generatedPassword, loginUrl);
      } catch (sendError) {
        console.error('Credentials email error', sendError);
      }
    }

    return NextResponse.json({ ok: true, created: Boolean(generatedPassword) });
  } catch (error) {
    console.error('Checkout create-account error', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
