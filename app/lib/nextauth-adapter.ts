import type { Adapter } from "next-auth/adapters";

// Minimal stub adapter for NextAuth.
// Replace with a real database adapter implementation when available.
export default function PostgresAdapter(sql: unknown): Adapter {
  return {} as Adapter;
}
