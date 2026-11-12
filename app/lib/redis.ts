import { createHash } from 'node:crypto';
import { createClient, type RedisClientType } from 'redis';

type RedisGlobal = typeof globalThis & {
  __gpVpsRedisClient?: RedisClientType;
  __gpVpsRedisConnection?: Promise<RedisClientType | null>;
  __gpVpsRedisRetryAfter?: number;
};

const redisGlobal = globalThis as RedisGlobal;
const HOME_RANDOM_PRODUCTS_CACHE_KEY = 'home:random-products:v1';
const SESSION_VALIDATION_CACHE_PREFIX = 'session:validated:v1:';
export const SESSION_VALIDATION_CACHE_TTL_SECONDS = 15;

export async function getRedisClient(): Promise<RedisClientType | null> {
  const url = process.env.REDIS_URL;
  if (!url) return null;

  if (redisGlobal.__gpVpsRedisClient?.isReady) {
    return redisGlobal.__gpVpsRedisClient;
  }

  if (redisGlobal.__gpVpsRedisConnection) {
    return redisGlobal.__gpVpsRedisConnection;
  }

  if ((redisGlobal.__gpVpsRedisRetryAfter ?? 0) > Date.now()) {
    return null;
  }

  redisGlobal.__gpVpsRedisClient?.destroy();

  const client = createClient({
    url,
    socket: {
      connectTimeout: 1000,
      reconnectStrategy: false,
    },
  });

  client.on('error', (error) => {
    console.error('Redis client error:', error);
  });

  redisGlobal.__gpVpsRedisClient = client;
  redisGlobal.__gpVpsRedisConnection = (async () => {
    try {
      await client.connect();
      redisGlobal.__gpVpsRedisRetryAfter = 0;
      return client;
    } catch (error) {
      console.error('Redis connection failed; continuing without cache:', error);
      redisGlobal.__gpVpsRedisRetryAfter = Date.now() + 10_000;
      client.destroy();
      if (redisGlobal.__gpVpsRedisClient === client) {
        redisGlobal.__gpVpsRedisClient = undefined;
      }
      return null;
    } finally {
      redisGlobal.__gpVpsRedisConnection = undefined;
    }
  })();

  return redisGlobal.__gpVpsRedisConnection;
}

export async function invalidateHomeRandomProductsCache(): Promise<void> {
  const client = await getRedisClient();
  if (!client) return;

  try {
    await client.del(HOME_RANDOM_PRODUCTS_CACHE_KEY);
  } catch (error) {
    console.error('Failed to invalidate the homepage product cache:', error);
  }
}

export function getSessionValidationCacheKey(token: string): string {
  const tokenHash = createHash('sha256').update(token).digest('hex');
  return `${SESSION_VALIDATION_CACHE_PREFIX}${tokenHash}`;
}

export async function invalidateSessionValidationCache(token: string): Promise<void> {
  const client = await getRedisClient();
  if (!client) return;

  try {
    await client.del(getSessionValidationCacheKey(token));
  } catch (error) {
    console.error('Failed to invalidate the session validation cache:', error);
  }
}

export { HOME_RANDOM_PRODUCTS_CACHE_KEY };
