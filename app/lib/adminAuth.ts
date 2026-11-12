import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function isAuthorizedAdminSession(sessionToken: string | undefined): Promise<boolean> {
  const adminEmail = process.env.ADMIN_EMAIL?.trim();
  if (!sessionToken || !adminEmail) return false;

  const admins = await sql<{ id: string }[]>`
    SELECT u.id
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.session_token = ${sessionToken}
      AND s.expires > NOW()
      AND u.role = 'admin'
      AND LOWER(u.email) = LOWER(${adminEmail})
      AND u.date_deleted IS NULL
    LIMIT 1
  `;

  return admins.length > 0;
}
