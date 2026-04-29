import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import postgres from "postgres";
import PostgresAdapter from "@/app/lib/nextauth-adapter";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null;
        try {
          const email = (credentials as Record<string, unknown>).email as string;
          const password = (credentials as Record<string, unknown>).password as string;
          
          const rows = await sql`
            SELECT id, name, email, password, email_verified
            FROM users
            WHERE email = ${email}
            LIMIT 1
          `;

          const user = rows[0];
          if (!user) return null;
          // require email verification
          if (!user.email_verified) {
            console.warn('Attempt to sign in with unverified email', email);
            return null;
          }

          const match = await bcrypt.compare(password, user.password);
          if (!match) return null;

          return { id: user.id, name: user.name, email: user.email };
        } catch (err) {
          console.error('Auth error', err);
          return null;
        }
      },
    }),
  ],
  adapter: PostgresAdapter(sql) as any,
  session: { strategy: "database", maxAge: 30 * 24 * 60 * 60 },
  // enable verbose debug logs in development
  debug: process.env.NEXTAUTH_DEBUG === 'true' || process.env.NODE_ENV !== 'production',
  logger: {
    error(code: string, metadata: unknown) {
      console.error('NextAuth error', code, metadata);
    },
    warn(code: string) {
      console.warn('NextAuth warn', code);
    },
    debug(code: string, metadata: unknown) {
      console.debug('NextAuth debug', code, metadata);
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "dev-secret",
};

const handler = NextAuth(authOptions as any);

export const GET = handler;
export const POST = handler;
