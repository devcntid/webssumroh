import { sql } from "@/lib/db";
import { CACHE_KEYS, getCachedOrFetch } from "@/lib/cache";
import type { Faq, FaqCategory, PaginatedResult } from "@/types/db";

const FAQ_TTL = 900;

const FAQ_CACHE_KEY_BY_CATEGORY: Record<string, string> = {
  general: CACHE_KEYS.FAQ_GENERAL,
  "halal-tour": CACHE_KEYS.FAQ_HALAL_TOUR,
  korporat: CACHE_KEYS.FAQ_KORPORAT,
};

export interface FaqInput {
  question: string;
  answer: string;
  category?: FaqCategory;
  is_active?: boolean;
  display_order?: number;
}

/**
 * Get active FAQs by category for public pages.
 * Called by: app/page.tsx
 */
export async function getPublicFaqs(
  category: string = "general",
  limit: number = 10
): Promise<Faq[]> {
  const cacheKey = FAQ_CACHE_KEY_BY_CATEGORY[category] ?? `faq:${category}`;
  const rows = await getCachedOrFetch<Faq[]>(
    cacheKey,
    async () =>
      (await sql`
        SELECT
          id, question, answer, category, is_active, display_order,
          created_at, updated_at, deleted_at, created_by, updated_by
        FROM faqs
        WHERE deleted_at IS NULL
          AND is_active = TRUE
          AND category = ${category}
        ORDER BY display_order ASC, created_at ASC
      `) as Faq[],
    FAQ_TTL
  );
  return rows.slice(0, limit);
}

/**
 * Paginated admin FAQ list.
 * Called by: GET /api/faqs (admin)
 */
export async function listFaqsAdmin(opts: {
  page?: number;
  perPage?: number;
  category?: FaqCategory | "all";
  status?: "active" | "inactive" | "all";
}): Promise<PaginatedResult<Faq>> {
  const page = opts.page ?? 1;
  const perPage = opts.perPage ?? 25;
  const offset = (page - 1) * perPage;
  const category = opts.category && opts.category !== "all" ? opts.category : null;
  const status = opts.status ?? "all";

  const rows = await sql`
    SELECT
      id, question, answer, category, is_active, display_order,
      created_at, updated_at, deleted_at, created_by, updated_by,
      COUNT(*) OVER() AS total_count
    FROM faqs
    WHERE deleted_at IS NULL
      AND (${category}::text IS NULL OR category = ${category})
      AND (
        ${status} = 'all'
        OR (${status} = 'active' AND is_active = TRUE)
        OR (${status} = 'inactive' AND is_active = FALSE)
      )
    ORDER BY category ASC, display_order ASC, id ASC
    LIMIT ${perPage}
    OFFSET ${offset}
  `;
  const total = rows.length > 0 ? Number((rows[0] as { total_count: number }).total_count) : 0;
  return {
    rows: rows.map(({ total_count: _, ...r }) => r as Faq),
    total,
  };
}

export async function getFaqById(id: number): Promise<Faq | null> {
  const rows = await sql`
    SELECT
      id, question, answer, category, is_active, display_order,
      created_at, updated_at, deleted_at, created_by, updated_by
    FROM faqs
    WHERE id = ${id} AND deleted_at IS NULL
    LIMIT 1
  `;
  return (rows[0] as Faq) ?? null;
}

export async function createFaq(input: FaqInput, userId: number): Promise<Faq> {
  const rows = await sql`
    INSERT INTO faqs (
      question, answer, category, is_active, display_order, created_by, updated_by
    )
    VALUES (
      ${input.question}, ${input.answer}, ${input.category ?? "general"},
      ${input.is_active ?? true}, ${input.display_order ?? 0}, ${userId}, ${userId}
    )
    RETURNING
      id, question, answer, category, is_active, display_order,
      created_at, updated_at, deleted_at, created_by, updated_by
  `;
  return rows[0] as Faq;
}

export async function updateFaq(
  id: number,
  input: FaqInput,
  userId: number
): Promise<Faq | null> {
  const rows = await sql`
    UPDATE faqs SET
      question = ${input.question},
      answer = ${input.answer},
      category = ${input.category ?? "general"},
      is_active = ${input.is_active ?? true},
      display_order = ${input.display_order ?? 0},
      updated_by = ${userId},
      updated_at = NOW()
    WHERE id = ${id} AND deleted_at IS NULL
    RETURNING
      id, question, answer, category, is_active, display_order,
      created_at, updated_at, deleted_at, created_by, updated_by
  `;
  return (rows[0] as Faq) ?? null;
}

export async function softDeleteFaq(id: number): Promise<void> {
  await sql`
    UPDATE faqs
    SET deleted_at = NOW(), updated_at = NOW()
    WHERE id = ${id} AND deleted_at IS NULL
  `;
}

/**
 * Reorder FAQs by ordered ids (typically within one category).
 */
export async function reorderFaqs(orderedIds: number[]): Promise<void> {
  if (orderedIds.length === 0) return;
  await sql`
    UPDATE faqs AS f
    SET display_order = u.ord::smallint, updated_at = NOW()
    FROM UNNEST(${orderedIds}::bigint[]) WITH ORDINALITY AS u(id, ord)
    WHERE f.id = u.id AND f.deleted_at IS NULL
  `;
}
