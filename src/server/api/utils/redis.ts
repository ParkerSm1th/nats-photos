/* Inspiration for this way of using redis was from my experience at Magical (getmagical.com) */

import { type Photo } from "@prisma/client";
import { createClient } from "redis";

interface RedisStorage {
  showPhotosLinks: Record<
    string,
    {
      url: string;
      expiresAt: number;
    }
  >;
}
interface RedisStorageKeyTypes extends Record<keyof RedisStorage, unknown> {
  showPhotosLinks: string;
}

const redisClient = createClient({
  disableOfflineQueue: true,
  url: process.env.REDIS_URL!,
  socket: {
    reconnectStrategy(tries) {
      if (tries > 3) {
        return new Error(
          `Redis connection error: tried to connect ${tries} times`
        );
      }
      return Math.min(tries * 50, 500);
    },
  },
});

function isObjectWithCodeStringProperty(obj: unknown): obj is { code: string } {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return (
    typeof obj === "object" &&
    !!obj &&
    "code" in obj &&
    typeof (obj as { code: unknown }).code === "string"
  );
}

function handleRedisError(e: unknown) {
  if (process.env.NODE_ENV === "test") {
    return;
  }
  if (isObjectWithCodeStringProperty(e) && e.code === "ECONNREFUSED") {
    return;
  }
  console.log(e);
}

export function reconnectRedis(): void {
  if (redisClient.isOpen) {
    return;
  }

  console.log("Redis wasn't connected so connecting now");
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  redisClient.connect().catch((_) => _);
}

export function getRedisStatus(): null | Record<string, boolean> {
  try {
    return {
      isOpen: redisClient.isOpen,
      isReady: redisClient.isReady,
    };
  } catch (ex) {
    return null;
  }
}

// eslint-disable-next-line max-params -- automatic disable, use an options object if possible
async function cacheSet<K extends keyof RedisStorage>(
  prefix: keyof RedisStorage,
  key: RedisStorageKeyTypes[K],
  value: string,
  ttl: number
): Promise<boolean> {
  if (!redisClient.isOpen) {
    return false;
  }
  try {
    await redisClient.set(`${prefix}:${key}`, value, {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      EX: ttl,
    });
    return true;
  } catch (error) {
    if (process.env.NODE_ENV === "test") {
      return false;
    }
    console.log("cacheSet: Failed to set for prefix:", prefix, error);
    return false;
  }
}

// eslint-disable-next-line max-params -- automatic disable, use an options object if possible
export async function cacheSetJSON<K extends keyof RedisStorage>(
  prefix: K,
  key: RedisStorageKeyTypes[K],
  value: RedisStorage[K],
  ttl: number
): Promise<void> {
  if (await cacheSet(prefix, key, JSON.stringify(value), ttl)) {
    console.log("cacheSetJSON: Successful set for prefix:", prefix);
  }
}

async function cacheGet<K extends keyof RedisStorage>(
  prefix: keyof RedisStorage,
  key: RedisStorageKeyTypes[K]
): Promise<string | null> {
  if (!redisClient.isOpen) {
    return null;
  }
  return redisClient.get(`${prefix}:${key}`);
}

export async function cacheGetJSON<K extends keyof RedisStorage>(
  prefix: K,
  key: RedisStorageKeyTypes[K]
): Promise<RedisStorage[K] | null> {
  const str = await cacheGet(prefix, key);
  if (!str) {
    return null;
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const obj: RedisStorage[K] | null = JSON.parse(str);
  if (obj) {
    console.log("cacheGetJSON: Successful read for prefix:", prefix);
  }
  return obj;
}

export async function invalidateCache<K extends keyof RedisStorage>(
  prefix: K,
  key: RedisStorageKeyTypes[K]
): Promise<void> {
  try {
    await redisClient.del(`${prefix}:${key}`);
  } catch (ex) {
    if (process.env.NODE_ENV === "test") {
      return;
    }
    console.log("invalidateCache:", ex);
  }
}

reconnectRedis();
redisClient.on("error", handleRedisError);
