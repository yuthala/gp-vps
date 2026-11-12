import postgres from 'postgres';
import { NextResponse } from 'next/server';
import {
  getRedisClient,
  getSessionValidationCacheKey,
  SESSION_VALIDATION_CACHE_TTL_SECONDS,
} from '@/app/lib/redis';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

type SessionValidationResponse = {
  ok: true;
  user: {
    id: string;
    role: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
  };
};

type SessionValidationRow = {
  user_id: string;
  role: string;
  email: string;
  first_name: string | null;
  second_name: string | null;
  phone_number: string | null;
  expires: Date | string;
};

function isSessionValidationResponse(value: unknown): value is SessionValidationResponse {
  if (typeof value !== 'object' || value === null) return false;
  const response = value as Record<string, unknown>;
  if (response.ok !== true || typeof response.user !== 'object' || response.user === null) {
    return false;
  }

  const user = response.user as Record<string, unknown>;
  return (
    typeof user.id === 'string' &&
    typeof user.role === 'string' &&
    typeof user.email === 'string' &&
    typeof user.firstName === 'string' &&
    typeof user.lastName === 'string' &&
    typeof user.phone === 'string'
  );
}

export async function GET(req: Request) {
  try {
    const cookie = req.headers.get('cookie') || '';
    const match = cookie.match(/session_token=([^;]+)/);
    const token = match ? match[1] : null;
    if (!token) return NextResponse.json({ ok: false }, { status: 401 });

    const redis = await getRedisClient();
    const cacheKey = getSessionValidationCacheKey(token);
    if (redis) {
      try {
        const cached = await redis.get(cacheKey);
        if (cached) {
          const parsed: unknown = JSON.parse(cached);
          if (isSessionValidationResponse(parsed)) return NextResponse.json(parsed);
          console.error('Session validation cache contained invalid data; querying PostgreSQL.');
        }
      } catch (error) {
        console.error('Failed to read the session validation cache:', error);
      }
    }

    const now = new Date().toISOString();
    const rows = await sql<SessionValidationRow[]>`
      SELECT
        s.user_id,
        u.role,
        u.email,
        cp.first_name,
        cp.second_name,
        cp.phone_number,
        s.expires
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

    const response: SessionValidationResponse = {
      ok: true,
      user: {
        id: row.user_id,
        role: row.role,
        email: row.email,
        firstName: row.first_name ?? '',
        lastName: row.second_name ?? '',
        phone: row.phone_number ?? '',
      },
    };

    if (redis) {
      const secondsUntilExpiry = Math.floor(
        (new Date(row.expires).getTime() - Date.now()) / 1000
      );
      const ttl = Math.min(SESSION_VALIDATION_CACHE_TTL_SECONDS, secondsUntilExpiry);
      if (ttl > 0) {
        try {
          await redis.set(cacheKey, JSON.stringify(response), { EX: ttl });
        } catch (error) {
          console.error('Failed to write the session validation cache:', error);
        }
      }
    }

    return NextResponse.json(response);
  } catch (err) {
    console.error('Session validate error', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
