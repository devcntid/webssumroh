import { sql } from "@/lib/db";
import { CACHE_KEYS, getCachedOrFetch } from "@/lib/cache";
import type { PageContext, PaginatedResult, Testimonial } from "@/types/db";

const TESTIMONIALS_TTL = 600;

const TESTIMONIALS_CACHE_KEY_BY_CONTEXT: Record<string, string> = {
  general: CACHE_KEYS.TESTIMONIALS_GENERAL,
  "halal-tour": CACHE_KEYS.TESTIMONIALS_HALAL,
  korporat: CACHE_KEYS.TESTIMONIALS_KORPORAT,
};

export interface TestimonialInput {
  full_name: string;
  initials: string;
  city_or_role?: string | null;
  package_name?: string | null;
  star_rating?: number;
  quote_text: string;
  page_context?: PageContext;
  date_collected?: string | null;
  is_verified?: boolean;
  is_active?: boolean;
  display_order?: number;
}

/**
 * Get verified testimonials by context for public pages.
 * Called by: app/page.tsx
 */
export async function getPublicTestimonials(
  context: string = "general",
  limit: number = 3
): Promise<Testimonial[]> {
  const cacheKey =
    TESTIMONIALS_CACHE_KEY_BY_CONTEXT[context] ?? `testimonials:${context}`;
  const rows = await getCachedOrFetch<Testimonial[]>(
    cacheKey,
    async () =>
      (await sql`
        SELECT
          id, full_name, initials, city_or_role, package_name, star_rating,
          quote_text, page_context, date_collected, is_verified, is_active,
          display_order, created_at, updated_at, deleted_at, created_by, updated_by
        FROM testimonials
        WHERE deleted_at IS NULL
          AND is_verified = TRUE
          AND is_active = TRUE
          AND page_context = ${context}
        ORDER BY display_order ASC, created_at DESC
      `) as Testimonial[],
    TESTIMONIALS_TTL
  );
  return rows.slice(0, limit);
}

/**
 * Paginated admin list with optional filters.
 * Called by: GET /api/testimonials (admin)
 */
export async function listTestimonialsAdmin(opts: {
  page?: number;
  perPage?: number;
  page_context?: PageContext | "all";
  verified?: "yes" | "no" | "all";
  active?: "yes" | "no" | "all";
}): Promise<PaginatedResult<Testimonial>> {
  const page = opts.page ?? 1;
  const perPage = opts.perPage ?? 25;
  const offset = (page - 1) * perPage;
  const pageContext = opts.page_context && opts.page_context !== "all" ? opts.page_context : null;
  const verified = opts.verified ?? "all";
  const active = opts.active ?? "all";

  const rows = await sql`
    SELECT
      id, full_name, initials, city_or_role, package_name, star_rating,
      quote_text, page_context, date_collected, is_verified, is_active,
      display_order, created_at, updated_at, deleted_at, created_by, updated_by,
      COUNT(*) OVER() AS total_count
    FROM testimonials
    WHERE deleted_at IS NULL
      AND (${pageContext}::text IS NULL OR page_context = ${pageContext})
      AND (
        ${verified} = 'all'
        OR (${verified} = 'yes' AND is_verified = TRUE)
        OR (${verified} = 'no' AND is_verified = FALSE)
      )
      AND (
        ${active} = 'all'
        OR (${active} = 'yes' AND is_active = TRUE)
        OR (${active} = 'no' AND is_active = FALSE)
      )
    ORDER BY display_order ASC, created_at DESC
    LIMIT ${perPage}
    OFFSET ${offset}
  `;
  const total = rows.length > 0 ? Number((rows[0] as { total_count: number }).total_count) : 0;
  return {
    rows: rows.map(({ total_count: _, ...r }) => r as Testimonial),
    total,
  };
}

export async function getTestimonialById(id: number): Promise<Testimonial | null> {
  const rows = await sql`
    SELECT
      id, full_name, initials, city_or_role, package_name, star_rating,
      quote_text, page_context, date_collected, is_verified, is_active,
      display_order, created_at, updated_at, deleted_at, created_by, updated_by
    FROM testimonials
    WHERE id = ${id} AND deleted_at IS NULL
    LIMIT 1
  `;
  return (rows[0] as Testimonial) ?? null;
}

export async function createTestimonial(
  input: TestimonialInput,
  userId: number
): Promise<Testimonial> {
  const rows = await sql`
    INSERT INTO testimonials (
      full_name, initials, city_or_role, package_name, star_rating, quote_text,
      page_context, date_collected, is_verified, is_active, display_order,
      created_by, updated_by
    )
    VALUES (
      ${input.full_name}, ${input.initials}, ${input.city_or_role ?? null},
      ${input.package_name ?? null}, ${input.star_rating ?? 5}, ${input.quote_text},
      ${input.page_context ?? "general"}, ${input.date_collected ?? null},
      ${input.is_verified ?? false}, ${input.is_active ?? false},
      ${input.display_order ?? 0}, ${userId}, ${userId}
    )
    RETURNING
      id, full_name, initials, city_or_role, package_name, star_rating,
      quote_text, page_context, date_collected, is_verified, is_active,
      display_order, created_at, updated_at, deleted_at, created_by, updated_by
  `;
  return rows[0] as Testimonial;
}

export async function updateTestimonial(
  id: number,
  input: TestimonialInput,
  userId: number
): Promise<Testimonial | null> {
  const rows = await sql`
    UPDATE testimonials SET
      full_name = ${input.full_name},
      initials = ${input.initials},
      city_or_role = ${input.city_or_role ?? null},
      package_name = ${input.package_name ?? null},
      star_rating = ${input.star_rating ?? 5},
      quote_text = ${input.quote_text},
      page_context = ${input.page_context ?? "general"},
      date_collected = ${input.date_collected ?? null},
      is_verified = ${input.is_verified ?? false},
      is_active = ${input.is_active ?? false},
      display_order = ${input.display_order ?? 0},
      updated_by = ${userId},
      updated_at = NOW()
    WHERE id = ${id} AND deleted_at IS NULL
    RETURNING
      id, full_name, initials, city_or_role, package_name, star_rating,
      quote_text, page_context, date_collected, is_verified, is_active,
      display_order, created_at, updated_at, deleted_at, created_by, updated_by
  `;
  return (rows[0] as Testimonial) ?? null;
}

export async function softDeleteTestimonial(id: number): Promise<void> {
  await sql`
    UPDATE testimonials
    SET deleted_at = NOW(), updated_at = NOW()
    WHERE id = ${id} AND deleted_at IS NULL
  `;
}

export async function bulkVerifyTestimonials(
  ids: number[],
  userId: number
): Promise<void> {
  if (ids.length === 0) return;
  await sql`
    UPDATE testimonials
    SET is_verified = TRUE, updated_by = ${userId}, updated_at = NOW()
    WHERE deleted_at IS NULL
      AND id = ANY(${ids}::bigint[])
  `;
}

export async function bulkDeactivateTestimonials(
  ids: number[],
  userId: number
): Promise<void> {
  if (ids.length === 0) return;
  await sql`
    UPDATE testimonials
    SET is_active = FALSE, updated_by = ${userId}, updated_at = NOW()
    WHERE deleted_at IS NULL
      AND id = ANY(${ids}::bigint[])
  `;
}

export async function reorderTestimonials(orderedIds: number[]): Promise<void> {
  if (orderedIds.length === 0) return;
  await sql`
    UPDATE testimonials AS t
    SET display_order = u.ord::smallint, updated_at = NOW()
    FROM UNNEST(${orderedIds}::bigint[]) WITH ORDINALITY AS u(id, ord)
    WHERE t.id = u.id AND t.deleted_at IS NULL
  `;
}
