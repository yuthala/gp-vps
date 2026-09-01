import postgres from 'postgres';
import { NextResponse } from 'next/server';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function GET(req: Request) {
  const base = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const cleanBase = base.replace(/\/$/, '');

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');

    if (!token) {
      return NextResponse.redirect(`${cleanBase}/verify?status=missing_token`);
    }

    const rows = await sql`
      SELECT id
      FROM users
      WHERE email_verification_token = ${token}
      LIMIT 1
    `;

    const user = rows[0];
    if (!user) {
      return NextResponse.redirect(`${cleanBase}/verify?status=expired`);
    }

    await sql`
      UPDATE users
      SET is_email_verified = true,
          email_verification_token = NULL,
          email_verified_at = NOW()
      WHERE id = ${user.id}
    `;

    return NextResponse.redirect(`${cleanBase}/verify?status=success`);
  } catch (err) {
    console.error('Verification error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
