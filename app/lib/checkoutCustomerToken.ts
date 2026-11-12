import { createHmac, timingSafeEqual } from 'node:crypto';

export const CHECKOUT_CUSTOMER_COOKIE = 'checkout_customer';
const CHECKOUT_CUSTOMER_TOKEN_TTL_SECONDS = 30 * 60;

function getSigningSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV !== 'production') return 'development-only-checkout-secret';
  throw new Error('NEXTAUTH_SECRET must be configured to link checkout orders to accounts.');
}

export function createCheckoutCustomerToken(userId: string): string {
  const expiresAt = Math.floor(Date.now() / 1000) + CHECKOUT_CUSTOMER_TOKEN_TTL_SECONDS;
  const payload = `${userId}.${expiresAt}`;
  const signature = createHmac('sha256', getSigningSecret()).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

export function verifyCheckoutCustomerToken(token: string): string | null {
  const [userId, expiresAtValue, signature, extra] = token.split('.');
  if (!userId || !expiresAtValue || !signature || extra !== undefined) return null;

  const expiresAt = Number(expiresAtValue);
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= Math.floor(Date.now() / 1000)) return null;

  const payload = `${userId}.${expiresAtValue}`;
  const expected = createHmac('sha256', getSigningSecret()).update(payload).digest();
  let actual: Buffer;
  try {
    actual = Buffer.from(signature, 'base64url');
  } catch {
    return null;
  }
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;

  return userId;
}

export const checkoutCustomerCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: CHECKOUT_CUSTOMER_TOKEN_TTL_SECONDS,
};
