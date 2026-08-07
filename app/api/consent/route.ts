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

    const ipAddress =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      req.headers.get('x-real-ip') ||
      '127.0.0.1';

    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

    await sql`
      CREATE TABLE IF NOT EXISTS customerspd (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        email TEXT NOT NULL UNIQUE,
        phone_number TEXT NOT NULL UNIQUE
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS consent_logs (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        customer_id UUID REFERENCES customerspd(id) ON DELETE CASCADE,
        consent_type VARCHAR(50) NOT NULL,
        version_agreed VARCHAR(10) NOT NULL,
        ip_address INET NOT NULL,
        signed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `;

    const existingCustomer = await sql`
      SELECT id FROM customerspd
      WHERE email = ${email} OR phone_number = ${phone}
      LIMIT 1
    `;

    let customerId = existingCustomer[0]?.id;

    if (!customerId) {
      try {
        const inserted = await sql`
          INSERT INTO customerspd (first_name, last_name, email, phone_number)
          VALUES (${firstName}, ${lastName}, ${email}, ${phone})
          RETURNING id
        `;
        customerId = inserted[0]?.id;
      } catch (insertError) {
        const conflictCustomer = await sql`
          SELECT id FROM customerspd
          WHERE email = ${email} OR phone_number = ${phone}
          LIMIT 1
        `;
        customerId = conflictCustomer[0]?.id;
      }
    }

    if (!customerId) {
      return NextResponse.json({ error: 'Unable to resolve customer record' }, { status: 500 });
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
