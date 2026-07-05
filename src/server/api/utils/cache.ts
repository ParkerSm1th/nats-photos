import { kv } from "@vercel/kv";

interface CacheStorage {
  showPhotosLinks: Record<
    string,
    {
      url: string;
      expiresAt: number;
    }
  >;
}
interface CacheStorageKeyTypes extends Record<keyof CacheStorage, unknown> {
  showPhotosLinks: string;
}

function cacheKey(prefix: keyof CacheStorage, key: CacheStorageKeyTypes[typeof prefix]) {
  return `${prefix}:${key}`;
}

export async function cacheSetJSON<K extends keyof CacheStorage>(
  prefix: K,
  key: CacheStorageKeyTypes[K],
  value: CacheStorage[K],
  ttl: number
): Promise<void> {
  try {
    await kv.set(cacheKey(prefix, key), value, { ex: ttl });
    console.log("cacheSetJSON: Successful set for prefix:", prefix);
  } catch (error) {
    if (process.env.NODE_ENV === "test") {
      return;
    }
    console.log("cacheSetJSON: Failed to set for prefix:", prefix, error);
  }
}

export async function cacheGetJSON<K extends keyof CacheStorage>(
  prefix: K,
  key: CacheStorageKeyTypes[K]
): Promise<CacheStorage[K] | null> {
  try {
    const value = await kv.get<CacheStorage[K]>(cacheKey(prefix, key));
    if (value) {
      console.log("cacheGetJSON: Successful read for prefix:", prefix);
    }
    return value;
  } catch (error) {
    if (process.env.NODE_ENV === "test") {
      return null;
    }
    console.log("cacheGetJSON: Failed to read for prefix:", prefix, error);
    return null;
  }
}

export async function invalidateCache<K extends keyof CacheStorage>(
  prefix: K,
  key: CacheStorageKeyTypes[K]
): Promise<void> {
  try {
    await kv.del(cacheKey(prefix, key));
  } catch (error) {
    if (process.env.NODE_ENV === "test") {
      return;
    }
    console.log("invalidateCache:", error);
  }
}
