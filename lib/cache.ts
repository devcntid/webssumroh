import { redis } from "@/lib/redis";

export const CACHE_KEYS = {
  PACKAGES_ACTIVE: "packages:active",
  PACKAGES_FEATURED: "packages:featured",
  HALAL_DEST_ACTIVE: "halal_dest:active",
  HALAL_PKGS_ACTIVE: "halal_pkgs:active",
  FAQ_GENERAL: "faq:general",
  FAQ_HALAL_TOUR: "faq:halal-tour",
  FAQ_KORPORAT: "faq:korporat",
  TESTIMONIALS_GENERAL: "testimonials:general",
  TESTIMONIALS_HALAL: "testimonials:halal-tour",
  TESTIMONIALS_KORPORAT: "testimonials:korporat",
  GALLERY_UMROH: "gallery:umroh",
  GALLERY_HALAL: "gallery:halal-tour",
  GALLERY_KORPORAT: "gallery:korporat",
  GALLERY_GENERAL: "gallery:general",
  TEAM_ACTIVE: "team:active",
  SITE_SETTINGS: "site_settings",
  DEPARTURES_PKG: (id: number) => `departures:pkg:${id}`,
} as const;

export async function getCached<T>(key: string): Promise<T | null> {
  try {
    const raw = await redis.get(key);
    if (raw === null || raw === undefined) return null;
    return (typeof raw === "string" ? JSON.parse(raw) : raw) as T;
  } catch {
    return null;
  }
}

export async function setCached<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
  try {
    await redis.set(key, JSON.stringify(value), { ex: ttlSeconds });
  } catch {
    // Cache failures must not break the request
  }
}

export async function invalidate(...keys: string[]): Promise<void> {
  if (keys.length === 0) return;
  try {
    await redis.del(...keys);
  } catch {
    // ignore
  }
}

export async function getCachedOrFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number
): Promise<T> {
  const cached = await getCached<T>(key);
  if (cached !== null) return cached;
  const data = await fetcher();
  await setCached(key, data, ttlSeconds);
  return data;
}
