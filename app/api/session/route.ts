import postgres from 'postgres';
import bcrypt from 'bcrypt';
import { NextResponse } from 'next/server';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

function genToken() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { randomBytes } = require('crypto');
    return randomBytes(32).toString('hex');
  } catch (e) {
    console.log(e)
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }
}

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) return NextResponse.json({ error: 'Missing' }, { status: 400 });

    const rows = await sql`
      SELECT id, password, email_verified
      FROM users
      WHERE email = ${email}
      LIMIT 1
    `;
    const user = rows[0];
    if (!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    if (!user.email_verified) return NextResponse.json({ error: 'Email not verified' }, { status: 403 });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

    // Check if an existing valid session exists for this user
    const cookie = req.headers.get('cookie') || '';
    const match = cookie.match(/session_token=([^;]+)/);
    const existingToken = match ? match[1] : null;

    let token: string = existingToken || genToken();
    let isNewSession = false;

    if (existingToken) {
      // Validate existing session
      const existingSession = await sql`
        SELECT expires
        FROM sessions
        WHERE session_token = ${existingToken} AND user_id = ${user.id}
        LIMIT 1
      `;
      if (existingSession[0] && new Date(existingSession[0].expires) > new Date()) {
        // Existing session is valid, reuse it
        token = existingToken;
      } else {
        // Existing session is invalid/expired, create new one
        isNewSession = true;
      }
    } else {
      // No existing session, create new one
      isNewSession = true;
    }

    // Create a new session if needed
    if (isNewSession) {
      token = genToken();
      const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      await sql`
        INSERT INTO sessions (user_id, session_token, expires)
        VALUES (${user.id}, ${token}, ${expires})
      `;
    }

    const res = NextResponse.json({ ok: true });
    res.cookies.set('session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });
    return res;
  } catch (err) {
    console.error('Session create error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const cookie = req.headers.get('cookie') || '';
    const match = cookie.match(/session_token=([^;]+)/);
    const token = match ? match[1] : null;
    if (token) {
      await sql`DELETE FROM sessions WHERE session_token = ${token}`;
    }
    const res = NextResponse.json({ ok: true });
    res.cookies.set('session_token', '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 0 });
    return res;
  } catch (err) {
    console.error('Session delete error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
