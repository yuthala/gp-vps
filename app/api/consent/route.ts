import { NextResponse } from 'next/server';
import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, phone, consentType, versionAgreed } = body;

    if (!firstName || !lastName || !email || !phone || !consentType || !versionAgreed) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const getClientIp = (request: Request) => {
      const headers = request.headers;
      const forwardedFor = headers.get('x-forwarded-for');
      if (forwardedFor) {
        const firstIp = forwardedFor.split(',').map((ip) => ip.trim()).find(Boolean);
        if (firstIp) return firstIp;
      }

      const ipHeaders = [
        'x-real-ip',
        'true-client-ip',
        'cf-connecting-ip',
        'fastly-client-ip',
        'x-cluster-client-ip',
      ];

      for (const header of ipHeaders) {
        const value = headers.get(header);
        if (value?.trim()) return value.trim();
      }

      return '127.0.0.1';
    };

    const ipAddress = getClientIp(req);

    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

    await sql`
      CREATE TABLE IF NOT EXISTS consent_logs (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        customer_id UUID REFERENCES users(id) ON DELETE CASCADE,
        consent_type VARCHAR(50) NOT NULL,
        version_agreed VARCHAR(10) NOT NULL,
        ip_address INET NOT NULL,
        signed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `;

    const existingUser = await sql`
      SELECT u.id
      FROM users u
      LEFT JOIN client_profiles cp ON cp.user_id = u.id
      WHERE u.email = ${email}
         OR cp.email = ${email}
         OR cp.phone_number = ${phone}
      LIMIT 1
    `;

    const customerId = existingUser[0]?.id;

    if (!customerId) {
      return NextResponse.json({ error: 'Unable to resolve customer record' }, { status: 404 });
    }

    await sql`
      INSERT INTO consent_logs (customer_id, consent_type, version_agreed, ip_address)
      VALUES (${customerId}, ${consentType}, ${versionAgreed}, ${ipAddress})
    `;

    return NextResponse.json({ ok: true, customerId });
  } catch (error) {
    console.error('Consent insert error', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
