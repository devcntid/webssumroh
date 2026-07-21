import { sql } from "@/lib/db";
import { CACHE_KEYS, getCachedOrFetch } from "@/lib/cache";
import type { HeroSettings, SiteSetting } from "@/types/db";

const SITE_SETTINGS_TTL = 1800;

export interface SiteSettingsInput {
  phone_display: string;
  whatsapp_number: string;
  office_address: string;
  cs_name: string;
  ppiu_license: string;
  maps_embed_url?: string | null;
  hero_settings: HeroSettings;
}

/**
 * Get the single site settings record.
 * Called by: Layout, Homepage, Contact, etc.
 */
export async function getSiteSettings(): Promise<SiteSetting | null> {
  return getCachedOrFetch<SiteSetting | null>(
    CACHE_KEYS.SITE_SETTINGS,
    async () => {
      const rows = await sql`
        SELECT
          id, phone_display, whatsapp_number, office_address, cs_name,
          ppiu_license, maps_embed_url, hero_settings, updated_at, updated_by
        FROM site_settings
        ORDER BY id ASC
        LIMIT 1
      `;
      return (rows[0] as SiteSetting) ?? null;
    },
    SITE_SETTINGS_TTL
  );
}

/**
 * Update the single site settings record.
 * Called by: PUT /api/site-settings
 */
export async function updateSiteSettings(
  input: SiteSettingsInput,
  userId: number
): Promise<SiteSetting | null> {
  const existing = await getSiteSettings();
  if (!existing) return null;

  const rows = await sql`
    UPDATE site_settings SET
      phone_display = ${input.phone_display},
      whatsapp_number = ${input.whatsapp_number},
      office_address = ${input.office_address},
      cs_name = ${input.cs_name},
      ppiu_license = ${input.ppiu_license},
      maps_embed_url = ${input.maps_embed_url ?? null},
      hero_settings = ${JSON.stringify(input.hero_settings)}::jsonb,
      updated_by = ${userId},
      updated_at = NOW()
    WHERE id = ${existing.id}
    RETURNING
      id, phone_display, whatsapp_number, office_address, cs_name,
      ppiu_license, maps_embed_url, hero_settings, updated_at, updated_by
  `;
  return (rows[0] as SiteSetting) ?? null;
}
