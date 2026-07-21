import { sql } from "@/lib/db";
import { CACHE_KEYS, getCachedOrFetch } from "@/lib/cache";
import type { HalalDestination, PaginatedResult } from "@/types/db";

const HALAL_DEST_TTL = 900;

export interface HalalDestinationInput {
  country_name: string;
  flag_emoji?: string | null;
  badge_label?: string | null;
  description?: string | null;
  duration_text?: string | null;
  best_season?: string | null;
  starting_price_text?: string | null;
  cover_image_url?: string | null;
  is_active?: boolean;
  display_order?: number;
}

/**
 * Paginated admin list of halal destinations.
 * Called by: GET /api/halal-destinations (admin)
 */
export async function listHalalDestinationsAdmin(opts: {
  page?: number;
  perPage?: number;
  status?: "active" | "inactive" | "all";
  search?: string;
}): Promise<PaginatedResult<HalalDestination>> {
  const page = opts.page ?? 1;
  const perPage = opts.perPage ?? 25;
  const offset = (page - 1) * perPage;
  const status = opts.status ?? "all";
  const search = opts.search?.trim() ? `%${opts.search.trim()}%` : null;

  const rows = await sql`
    SELECT
      id, country_name, flag_emoji, badge_label, description, duration_text,
      best_season, starting_price_text, cover_image_url, is_active, display_order,
      created_at, updated_at, deleted_at, created_by, updated_by,
      COUNT(*) OVER() AS total_count
    FROM halal_destinations
    WHERE deleted_at IS NULL
      AND (
        ${status} = 'all'
        OR (${status} = 'active' AND is_active = TRUE)
        OR (${status} = 'inactive' AND is_active = FALSE)
      )
      AND (${search}::text IS NULL OR country_name ILIKE ${search})
    ORDER BY display_order ASC, id ASC
    LIMIT ${perPage}
    OFFSET ${offset}
  `;
  const total = rows.length > 0 ? Number((rows[0] as { total_count: number }).total_count) : 0;
  return {
    rows: rows.map(({ total_count: _, ...r }) => r as HalalDestination),
    total,
  };
}

/**
 * Active destinations for public pages.
 * Called by: public Halal Tour pages
 */
export async function getActiveHalalDestinations(): Promise<HalalDestination[]> {
  return getCachedOrFetch<HalalDestination[]>(
    CACHE_KEYS.HALAL_DEST_ACTIVE,
    async () =>
      (await sql`
        SELECT
          id, country_name, flag_emoji, badge_label, description, duration_text,
          best_season, starting_price_text, cover_image_url, is_active, display_order,
          created_at, updated_at, deleted_at, created_by, updated_by
        FROM halal_destinations
        WHERE deleted_at IS NULL
          AND is_active = TRUE
        ORDER BY display_order ASC, id ASC
      `) as HalalDestination[],
    HALAL_DEST_TTL
  );
}

export async function getHalalDestinationById(
  id: number
): Promise<HalalDestination | null> {
  const rows = await sql`
    SELECT
      id, country_name, flag_emoji, badge_label, description, duration_text,
      best_season, starting_price_text, cover_image_url, is_active, display_order,
      created_at, updated_at, deleted_at, created_by, updated_by
    FROM halal_destinations
    WHERE id = ${id} AND deleted_at IS NULL
    LIMIT 1
  `;
  return (rows[0] as HalalDestination) ?? null;
}

export async function createHalalDestination(
  input: HalalDestinationInput,
  userId: number
): Promise<HalalDestination> {
  const rows = await sql`
    INSERT INTO halal_destinations (
      country_name, flag_emoji, badge_label, description, duration_text,
      best_season, starting_price_text, cover_image_url, is_active, display_order,
      created_by, updated_by
    )
    VALUES (
      ${input.country_name}, ${input.flag_emoji ?? null}, ${input.badge_label ?? null},
      ${input.description ?? null}, ${input.duration_text ?? null},
      ${input.best_season ?? null}, ${input.starting_price_text ?? null},
      ${input.cover_image_url ?? null}, ${input.is_active ?? true},
      ${input.display_order ?? 0}, ${userId}, ${userId}
    )
    RETURNING
      id, country_name, flag_emoji, badge_label, description, duration_text,
      best_season, starting_price_text, cover_image_url, is_active, display_order,
      created_at, updated_at, deleted_at, created_by, updated_by
  `;
  return rows[0] as HalalDestination;
}

export async function updateHalalDestination(
  id: number,
  input: HalalDestinationInput,
  userId: number
): Promise<HalalDestination | null> {
  const rows = await sql`
    UPDATE halal_destinations SET
      country_name = ${input.country_name},
      flag_emoji = ${input.flag_emoji ?? null},
      badge_label = ${input.badge_label ?? null},
      description = ${input.description ?? null},
      duration_text = ${input.duration_text ?? null},
      best_season = ${input.best_season ?? null},
      starting_price_text = ${input.starting_price_text ?? null},
      cover_image_url = ${input.cover_image_url ?? null},
      is_active = ${input.is_active ?? true},
      display_order = ${input.display_order ?? 0},
      updated_by = ${userId},
      updated_at = NOW()
    WHERE id = ${id} AND deleted_at IS NULL
    RETURNING
      id, country_name, flag_emoji, badge_label, description, duration_text,
      best_season, starting_price_text, cover_image_url, is_active, display_order,
      created_at, updated_at, deleted_at, created_by, updated_by
  `;
  return (rows[0] as HalalDestination) ?? null;
}

export async function softDeleteHalalDestination(id: number): Promise<void> {
  const deps = await sql`
    SELECT id FROM halal_packages
    WHERE destination_id = ${id}
      AND deleted_at IS NULL
    LIMIT 1
  `;
  if (deps.length > 0) {
    throw new Error("DESTINATION_HAS_PACKAGES");
  }
  await sql`
    UPDATE halal_destinations
    SET deleted_at = NOW(), updated_at = NOW()
    WHERE id = ${id} AND deleted_at IS NULL
  `;
}

export async function reorderHalalDestinations(orderedIds: number[]): Promise<void> {
  if (orderedIds.length === 0) return;
  await sql`
    UPDATE halal_destinations AS d
    SET display_order = u.ord::smallint, updated_at = NOW()
    FROM UNNEST(${orderedIds}::bigint[]) WITH ORDINALITY AS u(id, ord)
    WHERE d.id = u.id AND d.deleted_at IS NULL
  `;
}
