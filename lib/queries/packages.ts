import { sql } from "@/lib/db";
import { CACHE_KEYS, getCachedOrFetch } from "@/lib/cache";
import type { Package, PackageCategory, PaginatedResult, PriceMode } from "@/types/db";

const PACKAGES_TTL = 300;

/**
 * Get featured active packages for the homepage.
 * Cached under CACHE_KEYS.PACKAGES_FEATURED; the full ordered set is cached and
 * sliced by `limit` so the key matches the admin invalidation exactly.
 * Called by: app/page.tsx
 */
export async function getFeaturedPackages(limit = 3): Promise<Package[]> {
  const rows = await getCachedOrFetch<Package[]>(
    CACHE_KEYS.PACKAGES_FEATURED,
    async () =>
      (await sql`
        SELECT
          id, slug, name, category, tag_line, description, detail_text, hotel_distance_m,
          flight_type, price_mode, price_idr, price_display_text, cover_image_url,
          is_featured, is_active, display_order, created_at, updated_at, deleted_at,
          created_by, updated_by
        FROM packages
        WHERE deleted_at IS NULL
          AND is_active = TRUE
        ORDER BY is_featured DESC, display_order ASC
      `) as Package[],
    PACKAGES_TTL
  );
  return rows.slice(0, limit);
}

export async function getActivePackages(): Promise<Package[]> {
  return getCachedOrFetch<Package[]>(
    CACHE_KEYS.PACKAGES_ACTIVE,
    async () =>
      (await sql`
        SELECT
          id, slug, name, category, tag_line, description, detail_text, hotel_distance_m,
          flight_type, price_mode, price_idr, price_display_text, cover_image_url,
          is_featured, is_active, display_order, created_at, updated_at, deleted_at,
          created_by, updated_by
        FROM packages
        WHERE deleted_at IS NULL
          AND is_active = TRUE
        ORDER BY display_order ASC
      `) as Package[],
    PACKAGES_TTL
  );
}

export async function listPackagesAdmin(opts: {
  page?: number;
  perPage?: number;
  category?: string;
  status?: "active" | "inactive" | "all";
  search?: string;
}): Promise<PaginatedResult<Package>> {
  const page = opts.page ?? 1;
  const perPage = opts.perPage ?? 25;
  const offset = (page - 1) * perPage;
  const category = opts.category && opts.category !== "all" ? opts.category : null;
  const status = opts.status ?? "all";
  const search = opts.search?.trim() ? `%${opts.search.trim()}%` : null;

  const rows = await sql`
    SELECT
      id, slug, name, category, tag_line, description, detail_text, hotel_distance_m,
      flight_type, price_mode, price_idr, price_display_text, cover_image_url,
      is_featured, is_active, display_order, created_at, updated_at, deleted_at,
      created_by, updated_by,
      COUNT(*) OVER() AS total_count
    FROM packages
    WHERE deleted_at IS NULL
      AND (${category}::text IS NULL OR category = ${category})
      AND (
        ${status} = 'all'
        OR (${status} = 'active' AND is_active = TRUE)
        OR (${status} = 'inactive' AND is_active = FALSE)
      )
      AND (${search}::text IS NULL OR name ILIKE ${search} OR slug ILIKE ${search})
    ORDER BY display_order ASC, id ASC
    LIMIT ${perPage}
    OFFSET ${offset}
  `;
  const total = rows.length > 0 ? Number((rows[0] as { total_count: number }).total_count) : 0;
  return {
    rows: rows.map(({ total_count: _, ...r }) => r as Package),
    total,
  };
}

export async function getPackageById(id: number): Promise<Package | null> {
  const rows = await sql`
    SELECT
      id, slug, name, category, tag_line, description, detail_text, hotel_distance_m,
      flight_type, price_mode, price_idr, price_display_text, cover_image_url,
      is_featured, is_active, display_order, created_at, updated_at, deleted_at,
      created_by, updated_by
    FROM packages
    WHERE id = ${id} AND deleted_at IS NULL
    LIMIT 1
  `;
  return (rows[0] as Package) ?? null;
}

export interface PackageInput {
  slug: string;
  name: string;
  category: PackageCategory;
  tag_line?: string | null;
  description?: string | null;
  detail_text?: string | null;
  hotel_distance_m?: number | null;
  flight_type?: string | null;
  price_mode: PriceMode;
  price_idr?: number | null;
  price_display_text?: string | null;
  cover_image_url?: string | null;
  is_featured?: boolean;
  is_active?: boolean;
  display_order?: number;
}

export async function createPackage(input: PackageInput, userId: number): Promise<Package> {
  if (input.is_featured) {
    await sql`UPDATE packages SET is_featured = FALSE, updated_at = NOW() WHERE deleted_at IS NULL`;
  }
  const rows = await sql`
    INSERT INTO packages (
      slug, name, category, tag_line, description, detail_text, hotel_distance_m,
      flight_type, price_mode, price_idr, price_display_text, cover_image_url,
      is_featured, is_active, display_order, created_by, updated_by
    )
    VALUES (
      ${input.slug}, ${input.name}, ${input.category},
      ${input.tag_line ?? null}, ${input.description ?? null}, ${input.detail_text ?? null},
      ${input.hotel_distance_m ?? null}, ${input.flight_type ?? "Direct ✈"},
      ${input.price_mode}, ${input.price_idr ?? null},
      ${input.price_display_text ?? null}, ${input.cover_image_url ?? null},
      ${input.is_featured ?? false}, ${input.is_active ?? true},
      ${input.display_order ?? 0}, ${userId}, ${userId}
    )
    RETURNING
      id, slug, name, category, tag_line, description, detail_text, hotel_distance_m,
      flight_type, price_mode, price_idr, price_display_text, cover_image_url,
      is_featured, is_active, display_order, created_at, updated_at, deleted_at,
      created_by, updated_by
  `;
  return rows[0] as Package;
}

export async function updatePackage(
  id: number,
  input: PackageInput,
  userId: number
): Promise<Package | null> {
  if (input.is_featured) {
    await sql`
      UPDATE packages SET is_featured = FALSE, updated_at = NOW()
      WHERE deleted_at IS NULL AND id <> ${id}
    `;
  }
  const rows = await sql`
    UPDATE packages SET
      slug = ${input.slug},
      name = ${input.name},
      category = ${input.category},
      tag_line = ${input.tag_line ?? null},
      description = ${input.description ?? null},
      detail_text = ${input.detail_text ?? null},
      hotel_distance_m = ${input.hotel_distance_m ?? null},
      flight_type = ${input.flight_type ?? "Direct ✈"},
      price_mode = ${input.price_mode},
      price_idr = ${input.price_idr ?? null},
      price_display_text = ${input.price_display_text ?? null},
      cover_image_url = ${input.cover_image_url ?? null},
      is_featured = ${input.is_featured ?? false},
      is_active = ${input.is_active ?? true},
      display_order = ${input.display_order ?? 0},
      updated_by = ${userId},
      updated_at = NOW()
    WHERE id = ${id} AND deleted_at IS NULL
    RETURNING
      id, slug, name, category, tag_line, description, detail_text, hotel_distance_m,
      flight_type, price_mode, price_idr, price_display_text, cover_image_url,
      is_featured, is_active, display_order, created_at, updated_at, deleted_at,
      created_by, updated_by
  `;
  return (rows[0] as Package) ?? null;
}

export async function softDeletePackage(id: number): Promise<void> {
  const deps = await sql`
    SELECT id FROM departure_schedules
    WHERE package_id = ${id}
      AND deleted_at IS NULL
      AND status IN ('upcoming', 'ongoing')
    LIMIT 1
  `;
  if (deps.length > 0) {
    throw new Error("PACKAGE_HAS_ACTIVE_DEPARTURES");
  }
  await sql`
    UPDATE packages SET deleted_at = NOW(), updated_at = NOW()
    WHERE id = ${id} AND deleted_at IS NULL
  `;
}

export async function reorderPackages(orderedIds: number[]): Promise<void> {
  if (orderedIds.length === 0) return;
  await sql`
    UPDATE packages AS p
    SET display_order = u.ord::smallint, updated_at = NOW()
    FROM UNNEST(${orderedIds}::bigint[]) WITH ORDINALITY AS u(id, ord)
    WHERE p.id = u.id AND p.deleted_at IS NULL
  `;
}

export async function togglePackageField(
  id: number,
  field: "is_featured" | "is_active",
  value: boolean,
  userId: number
): Promise<Package | null> {
  if (field === "is_featured" && value) {
    await sql`
      UPDATE packages SET is_featured = FALSE, updated_at = NOW()
      WHERE deleted_at IS NULL AND id <> ${id}
    `;
  }
  if (field === "is_featured") {
    const rows = await sql`
      UPDATE packages SET is_featured = ${value}, updated_by = ${userId}, updated_at = NOW()
      WHERE id = ${id} AND deleted_at IS NULL
      RETURNING
        id, slug, name, category, tag_line, description, detail_text, hotel_distance_m,
        flight_type, price_mode, price_idr, price_display_text, cover_image_url,
        is_featured, is_active, display_order, created_at, updated_at, deleted_at,
        created_by, updated_by
    `;
    return (rows[0] as Package) ?? null;
  }
  const rows = await sql`
    UPDATE packages SET is_active = ${value}, updated_by = ${userId}, updated_at = NOW()
    WHERE id = ${id} AND deleted_at IS NULL
    RETURNING
      id, slug, name, category, tag_line, description, detail_text, hotel_distance_m,
      flight_type, price_mode, price_idr, price_display_text, cover_image_url,
      is_featured, is_active, display_order, created_at, updated_at, deleted_at,
      created_by, updated_by
  `;
  return (rows[0] as Package) ?? null;
}
