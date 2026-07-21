import { redis } from "@/lib/redis";

/**
 * Login rate limit: max 5 attempts per IP per 15 minutes.
 * Returns true if the request is allowed.
 */
export async function checkLoginRateLimit(ip: string): Promise<boolean> {
  try {
    const key = `rate:login:${ip}`;
    const count = await redis.incr(key);
    if (count === 1) await redis.expire(key, 900);
    return count <= 5;
  } catch {
    return true; // fail open if Redis is unavailable
  }
}

export async function checkRateLimit(
  key: string,
  max: number,
  windowSeconds: number
): Promise<boolean> {
  try {
    const count = await redis.incr(key);
    if (count === 1) await redis.expire(key, windowSeconds);
    return count <= max;
  } catch {
    return true;
  }
}
