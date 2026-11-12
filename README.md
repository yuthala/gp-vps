This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
# gp-vps

## Redis product cache

The homepage's random product list is cached in Redis for up to two minutes.
Product and inventory changes invalidate the cached list. PostgreSQL remains the
source of truth; if Redis is not configured or is unavailable, the app reads
directly from PostgreSQL.

Successful `/api/session/validate` responses are cached for at most 15 seconds.
The Redis key contains a SHA-256 hash of the session token, not the token itself,
and logout invalidates that entry. A session or account revoked elsewhere may
remain accepted for up to 15 seconds.

On the VPS, configure the app's runtime environment with a Redis URL. For Redis
running on the same VPS with its default port:

```env
REDIS_URL=redis://127.0.0.1:6379
```

Keep Redis bound to localhost (or a private network), not exposed publicly. Restart
the Next.js app after setting `REDIS_URL`.

## Checkout and Yandex Delivery

Checkout simulates payment outside production, requests Yandex Delivery offers,
and automatically confirms the first returned self-pickup offer. Confirmation
books a real shipment in the Yandex production environment. Mock payment is
disabled when `NODE_ENV=production`.

```env
YANDEX_DELIVERY_TOKEN=...
YANDEX_SOURCE_STATION_ID=...
```

Run the admin-protected `/orders-seed` migration against the database before
testing so the order and order-item tables have the required checkout columns.
This migration also adds `orders.yandex_request_id` and backfills it from saved
Yandex confirmations. Keep the API token server-side; never put it in a
`NEXT_PUBLIC_*` variable.

Administrators can send cancellation requests for booked Yandex deliveries from
`/dashboard/orders`. Yandex cancellation responses with status `CREATED` are
shown as pending; the local order is marked cancelled only after Yandex returns
`SUCCESS`.

Order numbers use `YYMMDD-NNN` (for example, `261112-015`) with a daily counter
based on Moscow time. Run the admin-protected `/orders-seed` migration once to
convert existing numeric order numbers and initialize the counters.
