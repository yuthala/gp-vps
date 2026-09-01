import postgres from 'postgres';
import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto'
import { sendVerificationEmail } from '@/app/lib/email'

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

function generateToken() {
  try {
    //const { randomBytes } = require('crypto');
    return randomBytes(32).toString('hex');
  } catch {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    const rows = await sql`
      SELECT id, email, is_email_verified FROM users WHERE LOWER(email) = LOWER(${email}) AND date_deleted IS NULL LIMIT 1
    `;

    const user = rows[0];
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.is_email_verified) {
      return NextResponse.json({ error: 'Email already verified' }, { status: 400 });
    }

    const token = generateToken();

    await sql`
      UPDATE users
      SET email_verification_token = ${token}, email_verified_at = NULL
      WHERE id = ${user.id}
    `;

    try {
      const base = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const verifyUrl = `${base.replace(/\/$/, '')}/api/auth/verify?token=${token}`;
      await sendVerificationEmail(email, verifyUrl, user.email);
    } catch (e) {
      console.error('Error sending revalidation email', e);
    }

    return NextResponse.json({ ok: true, message: 'Verification email sent to ' + email }, { status: 200 });
  } catch (err) {
    console.error('Revalidate email error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
