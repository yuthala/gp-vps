import postgres from 'postgres';
import { NextResponse } from 'next/server';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function GET(req: Request) {
  try {
    const cookie = req.headers.get('cookie') || '';
    const match = cookie.match(/session_token=([^;]+)/);
    const token = match ? match[1] : null;
    if (!token) return NextResponse.json({ ok: false }, { status: 401 });

    const now = new Date().toISOString();
    const rows = await sql`
      SELECT s.user_id, u.name, u.email
      FROM sessions s
      JOIN users u ON u.id = s.user_id
      WHERE s.session_token = ${token}
      AND s.expires > ${now}
      LIMIT 1
    `;
    const row = rows[0];
    if (!row) return NextResponse.json({ ok: false }, { status: 401 });

    return NextResponse.json({ ok: true, user: { id: row.user_id, name: row.name, email: row.email } });
  } catch (err) {
    console.error('Session validate error', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
