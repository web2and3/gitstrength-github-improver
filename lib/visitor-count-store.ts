/**
 * Shared store for visitor count. Uses Upstash Redis when env vars are set so the
 * count is shared across all visitors and serverless instances. Otherwise falls back
 * to in-memory (per-instance, resets on cold start).
 */

const KEY_PREFIX = "vc:"

/** In-memory fallback when Redis is not configured. */
const memoryStore = new Map<string, number>()

function getRedis(): import("@upstash/redis").Redis | null {
  if (typeof process === "undefined") return null
  const url =
    process.env.KV_REST_API_URL ||
    process.env.UPSTASH_REDIS_REST_URL
  const token =
    process.env.KV_REST_API_TOKEN ||
    process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  try {
    const { Redis } = require("@upstash/redis")
    return new Redis({ url, token })
  } catch {
    return null
  }
}

/** Get current count for key. Returns null if not set. */
export async function getCount(key: string): Promise<number | null> {
  const redis = getRedis()
  if (redis) {
    const v = await redis.get(KEY_PREFIX + key)
    return v === null || v === undefined ? null : Number(v)
  }
  const v = memoryStore.get(key)
  return v === undefined ? null : v
}

/**
 * Increment count for key by 1. Seeds web2and3 to 9810 if missing so first incr = 9811.
 * Returns the new value after increment.
 */
export async function incrementCount(
  key: string,
  options?: { seedInitial?: number }
): Promise<number> {
  const redis = getRedis()
  if (redis) {
    const k = KEY_PREFIX + key
    if (options?.seedInitial != null) {
      const exists = await redis.get(k)
      if (exists === null || exists === undefined) {
        await redis.set(k, String(options.seedInitial))
      }
    }
    const newVal = await redis.incr(k)
    return newVal
  }
  const prev = memoryStore.get(key)
  const seed = options?.seedInitial
  const current = prev === undefined && seed != null ? seed + 1 : (prev ?? 0) + 1
  memoryStore.set(key, current)
  return current
}
