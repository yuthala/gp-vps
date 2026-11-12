import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function migrateOrderNumbers() {
  await sql.begin(async (tx) => {
    await tx`ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_number VARCHAR(20);`;
    await tx`ALTER TABLE orders ALTER COLUMN order_number DROP DEFAULT;`;
    await tx`ALTER TABLE orders ALTER COLUMN order_number TYPE VARCHAR(20) USING order_number::TEXT;`;

    await tx`
      WITH legacy AS (
        SELECT
          order_id,
          (COALESCE(created_at, NOW()) AT TIME ZONE 'Europe/Moscow')::date AS order_date,
          ROW_NUMBER() OVER (
            PARTITION BY (COALESCE(created_at, NOW()) AT TIME ZONE 'Europe/Moscow')::date
            ORDER BY created_at NULLS FIRST, order_id
          ) AS daily_sequence
        FROM orders
        WHERE order_number IS NULL
          OR order_number !~ '^[0-9]{6}-[0-9]{3,}$'
      ),
      numbered AS (
        SELECT
          legacy.order_id,
          legacy.order_date,
          COALESCE((
            SELECT MAX(SPLIT_PART(existing.order_number, '-', 2)::BIGINT)
            FROM orders existing
            WHERE existing.order_number ~ '^[0-9]{6}-[0-9]{3,}$'
              AND (COALESCE(existing.created_at, NOW()) AT TIME ZONE 'Europe/Moscow')::date = legacy.order_date
          ), 0) + legacy.daily_sequence AS daily_sequence
        FROM legacy
      )
      UPDATE orders AS existing
      SET order_number =
        TO_CHAR(numbered.order_date, 'YYMMDD') || '-' ||
        CASE
          WHEN numbered.daily_sequence < 1000 THEN LPAD(numbered.daily_sequence::TEXT, 3, '0')
          ELSE numbered.daily_sequence::TEXT
        END
      FROM numbered
      WHERE existing.order_id = numbered.order_id
    `;

    await tx`ALTER TABLE orders ALTER COLUMN order_number SET NOT NULL;`;
    await tx`CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_order_number_unique ON orders(order_number);`;
    await tx`
      CREATE TABLE IF NOT EXISTS order_number_counters (
        order_date DATE PRIMARY KEY,
        last_number BIGINT NOT NULL CHECK (last_number > 0)
      )
    `;
    await tx`
      INSERT INTO order_number_counters (order_date, last_number)
      SELECT
        (COALESCE(created_at, NOW()) AT TIME ZONE 'Europe/Moscow')::date,
        MAX(SPLIT_PART(order_number, '-', 2)::BIGINT)
      FROM orders
      WHERE order_number ~ '^[0-9]{6}-[0-9]{3,}$'
      GROUP BY (COALESCE(created_at, NOW()) AT TIME ZONE 'Europe/Moscow')::date
      ON CONFLICT (order_date) DO UPDATE
      SET last_number = GREATEST(order_number_counters.last_number, EXCLUDED.last_number)
    `;
  });
}
