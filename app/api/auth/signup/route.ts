import bcrypt from 'bcrypt';
import postgres from 'postgres';
import { NextResponse } from 'next/server';
import { randomBytes } from 'node:crypto';
import { sendVerificationEmail } from '@/app/lib/email'

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

function generateToken() {
  try {
    // Node's crypto in edge/runtime
    //const { randomBytes } = require('crypto');
    return randomBytes(32).toString('hex');
  } catch (e) {
    console.log(e)
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = body;
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const existing = await sql`SELECT id FROM users WHERE LOWER(email) = LOWER(${email}) AND date_deleted IS NULL LIMIT 1`;
    if (existing.length) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
    }

    const { registration_ip, registration_device } = getRegistrationMeta(req);
    const hashed = await bcrypt.hash(password, 10);
    const token = generateToken();

    await sql`
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
    `;

    const base = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const verifyUrl = `${base.replace(/\/$/, '')}/api/auth/verify?token=${token}`;

    try {
      await sendVerificationEmail(email, verifyUrl, name);
    } catch (e) {
      console.error('Error sending verification email', e);
    }

    return NextResponse.json({ ok: true, verifyUrl }, { status: 201 });
  } catch (err) {
    console.error('Signup error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
