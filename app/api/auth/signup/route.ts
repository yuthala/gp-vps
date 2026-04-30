import bcrypt from 'bcrypt';
import postgres from 'postgres';
import { NextResponse } from 'next/server';
import { randomBytes } from 'node:crypto';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

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

    const existing = await sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`;
    if (existing.length) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 10);

    const token = generateToken();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    await sql`
      INSERT INTO users (name, email, password, email_verified, verification_token, verification_expires)
      VALUES (${name}, ${email}, ${hashed}, false, ${token}, ${expires})
    `;

    // Build verification URL using NEXTAUTH_URL or fallback
    const base = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const verifyUrl = `${base.replace(/\/$/, '')}/api/auth/verify?token=${token}`;

    // Send verification email (SendGrid or SMTP) or fallback to console
    try {
      const { default: sendVerificationEmail } = await import('@/app/lib/email');
      await sendVerificationEmail(email, verifyUrl, name);
    } catch (e) {
      console.error('Error sending verification email', e);
    }

    // Always return verifyUrl so frontend knows to show verification message
    return NextResponse.json({ ok: true, verifyUrl }, { status: 201 });
  } catch (err) {
    console.error('Signup error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
