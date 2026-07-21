import { Redis } from "@upstash/redis";

function createRedis(): Redis {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    throw new Error("UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set");
  }

  return new Redis({ url, token });
}

let _redis: Redis | null = null;

export function getRedis(): Redis {
  if (!_redis) _redis = createRedis();
  return _redis;
}

/** Lazy proxy so importing this module does not throw at build time without env. */
export const redis = new Proxy({} as Redis, {
  get(_target, prop, receiver) {
    const client = getRedis();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
