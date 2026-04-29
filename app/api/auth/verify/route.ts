import postgres from 'postgres';
import { NextResponse } from 'next/server';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');
    if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 });

    const now = new Date().toISOString();
    const rows = await sql`
      SELECT id, email FROM users
      WHERE verification_token = ${token}
      AND verification_expires > ${now}
      LIMIT 1
    `;

    const user = rows[0];
    if (!user) return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });

    await sql`
      UPDATE users
      SET email_verified = true,
          verification_token = NULL,
          verification_expires = NULL
      WHERE id = ${user.id}
    `;

    // Redirect to friendly verification page with status
    const base = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const redirectTo = `${base.replace(/\/$/, '')}/verify?status=success`;
    return NextResponse.redirect(redirectTo);
  } catch (err) {
    console.error('Verification error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
