import { sql } from "@/lib/db";
import type { HalalPackage, PaginatedResult } from "@/types/db";

export interface HalalPackageWithDestination extends HalalPackage {
  country_name: string;
}

export interface HalalPackageInput {
  destination_id: number;
  name: string;
  tag_line?: string | null;
  is_featured?: boolean;
  seats_remaining?: number | null;
  meta_chips?: string[];
  highlights_text?: string | null;
  price_display_text?: string | null;
  price_idr?: number | null;
  cover_image_url?: string | null;
  departure_month?: string | null;
  departure_date?: string | null;
  is_active?: boolean;
  display_order?: number;
}

/**
 * Paginated admin list with destination country_name join.
 * Called by: GET /api/halal-packages (admin)
 */
export async function listHalalPackagesAdmin(opts: {
  page?: number;
  perPage?: number;
  destinationId?: number;
  status?: "active" | "inactive" | "all";
  search?: string;
}): Promise<PaginatedResult<HalalPackageWithDestination>> {
  const page = opts.page ?? 1;
  const perPage = opts.perPage ?? 25;
  const offset = (page - 1) * perPage;
  const destinationId = opts.destinationId ?? null;
  const status = opts.status ?? "all";
  const search = opts.search?.trim() ? `%${opts.search.trim()}%` : null;

  const rows = await sql`
    SELECT
      hp.id, hp.destination_id, hp.name, hp.tag_line, hp.is_featured,
      hp.seats_remaining, hp.meta_chips, hp.highlights_text, hp.price_display_text,
      hp.price_idr, hp.cover_image_url, hp.departure_month, hp.departure_date,
      hp.is_active, hp.display_order, hp.created_at, hp.updated_at, hp.deleted_at,
      hp.created_by, hp.updated_by,
      hd.country_name,
      COUNT(*) OVER() AS total_count
    FROM halal_packages hp
    INNER JOIN halal_destinations hd ON hd.id = hp.destination_id
    WHERE hp.deleted_at IS NULL
      AND (${destinationId}::bigint IS NULL OR hp.destination_id = ${destinationId})
      AND (
        ${status} = 'all'
        OR (${status} = 'active' AND hp.is_active = TRUE)
        OR (${status} = 'inactive' AND hp.is_active = FALSE)
      )
      AND (${search}::text IS NULL OR hp.name ILIKE ${search})
    ORDER BY hp.display_order ASC, hp.id ASC
    LIMIT ${perPage}
    OFFSET ${offset}
  `;
  const total = rows.length > 0 ? Number((rows[0] as { total_count: number }).total_count) : 0;
  return {
    rows: rows.map(({ total_count: _, ...r }) => r as HalalPackageWithDestination),
    total,
  };
}

export async function getHalalPackageById(
  id: number
): Promise<HalalPackageWithDestination | null> {
  const rows = await sql`
    SELECT
      hp.id, hp.destination_id, hp.name, hp.tag_line, hp.is_featured,
      hp.seats_remaining, hp.meta_chips, hp.highlights_text, hp.price_display_text,
      hp.price_idr, hp.cover_image_url, hp.departure_month, hp.departure_date,
      hp.is_active, hp.display_order, hp.created_at, hp.updated_at, hp.deleted_at,
      hp.created_by, hp.updated_by,
      hd.country_name
    FROM halal_packages hp
    INNER JOIN halal_destinations hd ON hd.id = hp.destination_id
    WHERE hp.id = ${id} AND hp.deleted_at IS NULL
    LIMIT 1
  `;
  return (rows[0] as HalalPackageWithDestination) ?? null;
}

export async function createHalalPackage(
  input: HalalPackageInput,
  userId: number
): Promise<HalalPackage> {
  const metaChips = JSON.stringify(input.meta_chips ?? []);
  const rows = await sql`
    INSERT INTO halal_packages (
      destination_id, name, tag_line, is_featured, seats_remaining, meta_chips,
      highlights_text, price_display_text, price_idr, cover_image_url,
      departure_month, departure_date, is_active, display_order,
      created_by, updated_by
    )
    VALUES (
      ${input.destination_id}, ${input.name}, ${input.tag_line ?? null},
      ${input.is_featured ?? false}, ${input.seats_remaining ?? null},
      ${metaChips}::jsonb, ${input.highlights_text ?? null},
      ${input.price_display_text ?? null}, ${input.price_idr ?? null},
      ${input.cover_image_url ?? null}, ${input.departure_month ?? null},
      ${input.departure_date ?? null}, ${input.is_active ?? true},
      ${input.display_order ?? 0}, ${userId}, ${userId}
    )
    RETURNING
      id, destination_id, name, tag_line, is_featured, seats_remaining, meta_chips,
      highlights_text, price_display_text, price_idr, cover_image_url,
      departure_month, departure_date, is_active, display_order,
      created_at, updated_at, deleted_at, created_by, updated_by
  `;
  return rows[0] as HalalPackage;
}

export async function updateHalalPackage(
  id: number,
  input: HalalPackageInput,
  userId: number
): Promise<HalalPackage | null> {
  const metaChips = JSON.stringify(input.meta_chips ?? []);
  const rows = await sql`
    UPDATE halal_packages SET
      destination_id = ${input.destination_id},
      name = ${input.name},
      tag_line = ${input.tag_line ?? null},
      is_featured = ${input.is_featured ?? false},
      seats_remaining = ${input.seats_remaining ?? null},
      meta_chips = ${metaChips}::jsonb,
      highlights_text = ${input.highlights_text ?? null},
      price_display_text = ${input.price_display_text ?? null},
      price_idr = ${input.price_idr ?? null},
      cover_image_url = ${input.cover_image_url ?? null},
      departure_month = ${input.departure_month ?? null},
      departure_date = ${input.departure_date ?? null},
      is_active = ${input.is_active ?? true},
      display_order = ${input.display_order ?? 0},
      updated_by = ${userId},
      updated_at = NOW()
    WHERE id = ${id} AND deleted_at IS NULL
    RETURNING
      id, destination_id, name, tag_line, is_featured, seats_remaining, meta_chips,
      highlights_text, price_display_text, price_idr, cover_image_url,
      departure_month, departure_date, is_active, display_order,
      created_at, updated_at, deleted_at, created_by, updated_by
  `;
  return (rows[0] as HalalPackage) ?? null;
}

export async function softDeleteHalalPackage(id: number): Promise<void> {
  await sql`
    UPDATE halal_packages
    SET deleted_at = NOW(), updated_at = NOW()
    WHERE id = ${id} AND deleted_at IS NULL
  `;
}

export async function reorderHalalPackages(orderedIds: number[]): Promise<void> {
  if (orderedIds.length === 0) return;
  await sql`
    UPDATE halal_packages AS hp
    SET display_order = u.ord::smallint, updated_at = NOW()
    FROM UNNEST(${orderedIds}::bigint[]) WITH ORDINALITY AS u(id, ord)
    WHERE hp.id = u.id AND hp.deleted_at IS NULL
  `;
}
