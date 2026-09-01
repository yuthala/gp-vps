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
      SELECT
        s.user_id,
        u.role,
        u.email,
        cp.first_name,
        cp.second_name,
        cp.phone_number
      FROM sessions s
      JOIN users u ON u.id = s.user_id
      LEFT JOIN client_profiles cp ON cp.user_id = u.id
      WHERE s.session_token = ${token}
      AND s.expires > ${now}
      AND u.date_deleted IS NULL
      LIMIT 1
    `;
    const row = rows[0];
    if (!row) return NextResponse.json({ ok: false }, { status: 401 });

    return NextResponse.json({
      ok: true,
      user: {
        id: row.user_id,
        role: row.role,
        email: row.email,
        firstName: row.first_name ?? '',
        lastName: row.second_name ?? '',
        phone: row.phone_number ?? '',
      },
    });
  } catch (err) {
    console.error('Session validate error', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
