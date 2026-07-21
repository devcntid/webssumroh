import { sql } from "@/lib/db";
import type { GalleryCategory, GalleryItem, PaginatedResult } from "@/types/db";

export interface GalleryItemInput {
  image_url: string;
  thumbnail_url?: string | null;
  alt_text: string;
  caption?: string | null;
  category?: GalleryCategory;
  file_size_kb?: number | null;
  width_px?: number | null;
  height_px?: number | null;
  is_active?: boolean;
  display_order?: number;
}

/**
 * Paginated admin gallery list.
 * Called by: GET /api/gallery (admin)
 */
export async function listGalleryAdmin(opts: {
  page?: number;
  perPage?: number;
  category?: GalleryCategory | "all";
  status?: "active" | "inactive" | "all";
}): Promise<PaginatedResult<GalleryItem>> {
  const page = opts.page ?? 1;
  const perPage = opts.perPage ?? 25;
  const offset = (page - 1) * perPage;
  const category = opts.category && opts.category !== "all" ? opts.category : null;
  const status = opts.status ?? "all";

  const rows = await sql`
    SELECT
      id, image_url, thumbnail_url, alt_text, caption, category,
      file_size_kb, width_px, height_px, is_active, display_order,
      created_at, updated_at, deleted_at, created_by,
      COUNT(*) OVER() AS total_count
    FROM gallery_items
    WHERE deleted_at IS NULL
      AND (${category}::text IS NULL OR category = ${category})
      AND (
        ${status} = 'all'
        OR (${status} = 'active' AND is_active = TRUE)
        OR (${status} = 'inactive' AND is_active = FALSE)
      )
    ORDER BY display_order ASC, id ASC
    LIMIT ${perPage}
    OFFSET ${offset}
  `;
  const total = rows.length > 0 ? Number((rows[0] as { total_count: number }).total_count) : 0;
  return {
    rows: rows.map(({ total_count: _, ...r }) => r as GalleryItem),
    total,
  };
}

export async function getGalleryItemById(id: number): Promise<GalleryItem | null> {
  const rows = await sql`
    SELECT
      id, image_url, thumbnail_url, alt_text, caption, category,
      file_size_kb, width_px, height_px, is_active, display_order,
      created_at, updated_at, deleted_at, created_by
    FROM gallery_items
    WHERE id = ${id} AND deleted_at IS NULL
    LIMIT 1
  `;
  return (rows[0] as GalleryItem) ?? null;
}

export async function createGalleryItem(
  input: GalleryItemInput,
  userId: number
): Promise<GalleryItem> {
  const rows = await sql`
    INSERT INTO gallery_items (
      image_url, thumbnail_url, alt_text, caption, category,
      file_size_kb, width_px, height_px, is_active, display_order, created_by
    )
    VALUES (
      ${input.image_url}, ${input.thumbnail_url ?? null}, ${input.alt_text},
      ${input.caption ?? null}, ${input.category ?? "general"},
      ${input.file_size_kb ?? null}, ${input.width_px ?? null},
      ${input.height_px ?? null}, ${input.is_active ?? true},
      ${input.display_order ?? 0}, ${userId}
    )
    RETURNING
      id, image_url, thumbnail_url, alt_text, caption, category,
      file_size_kb, width_px, height_px, is_active, display_order,
      created_at, updated_at, deleted_at, created_by
  `;
  return rows[0] as GalleryItem;
}

export async function updateGalleryItem(
  id: number,
  input: GalleryItemInput
): Promise<GalleryItem | null> {
  const rows = await sql`
    UPDATE gallery_items SET
      image_url = ${input.image_url},
      thumbnail_url = ${input.thumbnail_url ?? null},
      alt_text = ${input.alt_text},
      caption = ${input.caption ?? null},
      category = ${input.category ?? "general"},
      file_size_kb = ${input.file_size_kb ?? null},
      width_px = ${input.width_px ?? null},
      height_px = ${input.height_px ?? null},
      is_active = ${input.is_active ?? true},
      display_order = ${input.display_order ?? 0},
      updated_at = NOW()
    WHERE id = ${id} AND deleted_at IS NULL
    RETURNING
      id, image_url, thumbnail_url, alt_text, caption, category,
      file_size_kb, width_px, height_px, is_active, display_order,
      created_at, updated_at, deleted_at, created_by
  `;
  return (rows[0] as GalleryItem) ?? null;
}

export async function softDeleteGalleryItem(id: number): Promise<void> {
  await sql`
    UPDATE gallery_items
    SET deleted_at = NOW(), updated_at = NOW()
    WHERE id = ${id} AND deleted_at IS NULL
  `;
}

export async function reorderGalleryItems(orderedIds: number[]): Promise<void> {
  if (orderedIds.length === 0) return;
  await sql`
    UPDATE gallery_items AS g
    SET display_order = u.ord::smallint, updated_at = NOW()
    FROM UNNEST(${orderedIds}::bigint[]) WITH ORDINALITY AS u(id, ord)
    WHERE g.id = u.id AND g.deleted_at IS NULL
  `;
}

export async function bulkSetGalleryActive(
  ids: number[],
  isActive: boolean
): Promise<void> {
  if (ids.length === 0) return;
  await sql`
    UPDATE gallery_items
    SET is_active = ${isActive}, updated_at = NOW()
    WHERE deleted_at IS NULL
      AND id = ANY(${ids}::bigint[])
  `;
}
