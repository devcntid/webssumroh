import { sql } from "@/lib/db";
import type { MediaAsset, PaginatedResult } from "@/types/db";

export interface MediaAssetInput {
  title: string;
  image_url: string;
  alt_text?: string | null;
  file_size_kb?: number | null;
  width_px?: number | null;
  height_px?: number | null;
}

/**
 * Paginated admin media library list with optional title search.
 * Called by: GET /api/media
 */
export async function listMediaAssets(opts: {
  page?: number;
  perPage?: number;
  q?: string;
}): Promise<PaginatedResult<MediaAsset>> {
  const page = opts.page ?? 1;
  const perPage = opts.perPage ?? 25;
  const offset = (page - 1) * perPage;
  const q = opts.q?.trim() ? `%${opts.q.trim()}%` : null;

  const rows = await sql`
    SELECT
      id, title, image_url, alt_text, file_size_kb, width_px, height_px,
      created_at, updated_at, deleted_at, created_by, updated_by,
      COUNT(*) OVER() AS total_count
    FROM media_assets
    WHERE deleted_at IS NULL
      AND (${q}::text IS NULL OR title ILIKE ${q} OR image_url ILIKE ${q})
    ORDER BY created_at DESC, id DESC
    LIMIT ${perPage}
    OFFSET ${offset}
  `;

  const total = rows.length > 0 ? Number((rows[0] as { total_count: number }).total_count) : 0;
  return {
    rows: rows.map(({ total_count: _, ...r }) => r as MediaAsset),
    total,
  };
}

/**
 * Single media asset by id.
 * Called by: GET /api/media/[id]
 */
export async function getMediaAssetById(id: number): Promise<MediaAsset | null> {
  const rows = await sql`
    SELECT
      id, title, image_url, alt_text, file_size_kb, width_px, height_px,
      created_at, updated_at, deleted_at, created_by, updated_by
    FROM media_assets
    WHERE id = ${id} AND deleted_at IS NULL
    LIMIT 1
  `;
  return (rows[0] as MediaAsset) ?? null;
}

/**
 * Create a media library item after upload or URL paste.
 * Called by: POST /api/media
 */
export async function createMediaAsset(
  input: MediaAssetInput,
  userId: number
): Promise<MediaAsset> {
  const rows = await sql`
    INSERT INTO media_assets (
      title, image_url, alt_text, file_size_kb, width_px, height_px,
      created_by, updated_by
    )
    VALUES (
      ${input.title},
      ${input.image_url},
      ${input.alt_text ?? null},
      ${input.file_size_kb ?? null},
      ${input.width_px ?? null},
      ${input.height_px ?? null},
      ${userId},
      ${userId}
    )
    RETURNING
      id, title, image_url, alt_text, file_size_kb, width_px, height_px,
      created_at, updated_at, deleted_at, created_by, updated_by
  `;
  return rows[0] as MediaAsset;
}

/**
 * Update media title / URL / metadata.
 * Called by: PUT /api/media/[id]
 */
export async function updateMediaAsset(
  id: number,
  input: MediaAssetInput,
  userId: number
): Promise<MediaAsset | null> {
  const rows = await sql`
    UPDATE media_assets SET
      title = ${input.title},
      image_url = ${input.image_url},
      alt_text = ${input.alt_text ?? null},
      file_size_kb = ${input.file_size_kb ?? null},
      width_px = ${input.width_px ?? null},
      height_px = ${input.height_px ?? null},
      updated_by = ${userId},
      updated_at = NOW()
    WHERE id = ${id} AND deleted_at IS NULL
    RETURNING
      id, title, image_url, alt_text, file_size_kb, width_px, height_px,
      created_at, updated_at, deleted_at, created_by, updated_by
  `;
  return (rows[0] as MediaAsset) ?? null;
}

/**
 * Soft-delete a media asset.
 * Called by: DELETE /api/media/[id]
 */
export async function softDeleteMediaAsset(id: number): Promise<boolean> {
  const rows = await sql`
    UPDATE media_assets
    SET deleted_at = NOW(), updated_at = NOW()
    WHERE id = ${id} AND deleted_at IS NULL
    RETURNING id
  `;
  return rows.length > 0;
}
