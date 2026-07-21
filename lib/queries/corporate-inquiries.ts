import { sql } from "@/lib/db";
import type { CorporateInquiry, CorpStatus, PaginatedResult, TravelType } from "@/types/db";

/**
 * Paginated admin list of corporate inquiries.
 * Called by: GET /api/corporate-inquiries (admin)
 * Never soft-deleted — compliance retention.
 */
export async function listCorporateInquiriesAdmin(opts: {
  page?: number;
  perPage?: number;
  status?: CorpStatus | "all";
  travel_type?: TravelType | "all";
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<PaginatedResult<CorporateInquiry>> {
  const page = opts.page ?? 1;
  const perPage = opts.perPage ?? 25;
  const offset = (page - 1) * perPage;
  const status = opts.status && opts.status !== "all" ? opts.status : null;
  const travelType =
    opts.travel_type && opts.travel_type !== "all" ? opts.travel_type : null;
  const search = opts.search?.trim() ? `%${opts.search.trim()}%` : null;
  const dateFrom = opts.dateFrom ?? null;
  const dateTo = opts.dateTo ?? null;

  const rows = await sql`
    SELECT
      id, company_name, contact_person, phone, email, estimated_pax,
      travel_type, preferred_date, notes, status, agent_notes, assigned_to,
      quoted_at, closed_at, created_at, updated_at,
      COUNT(*) OVER() AS total_count
    FROM corporate_inquiries
    WHERE (${status}::text IS NULL OR status = ${status})
      AND (${travelType}::text IS NULL OR travel_type = ${travelType})
      AND (
        ${search}::text IS NULL
        OR company_name ILIKE ${search}
        OR contact_person ILIKE ${search}
        OR phone ILIKE ${search}
        OR email ILIKE ${search}
      )
      AND (${dateFrom}::date IS NULL OR created_at::date >= ${dateFrom}::date)
      AND (${dateTo}::date IS NULL OR created_at::date <= ${dateTo}::date)
    ORDER BY created_at DESC, id DESC
    LIMIT ${perPage}
    OFFSET ${offset}
  `;
  const total = rows.length > 0 ? Number((rows[0] as { total_count: number }).total_count) : 0;
  return {
    rows: rows.map(({ total_count: _, ...r }) => r as CorporateInquiry),
    total,
  };
}

export async function getCorporateInquiryById(
  id: number
): Promise<CorporateInquiry | null> {
  const rows = await sql`
    SELECT
      id, company_name, contact_person, phone, email, estimated_pax,
      travel_type, preferred_date, notes, status, agent_notes, assigned_to,
      quoted_at, closed_at, created_at, updated_at
    FROM corporate_inquiries
    WHERE id = ${id}
    LIMIT 1
  `;
  return (rows[0] as CorporateInquiry) ?? null;
}

export async function updateCorporateInquiryStatus(
  id: number,
  status: CorpStatus,
  assignedTo?: number | null
): Promise<CorporateInquiry | null> {
  const rows = await sql`
    UPDATE corporate_inquiries SET
      status = ${status},
      assigned_to = COALESCE(${assignedTo ?? null}::bigint, assigned_to),
      quoted_at = CASE
        WHEN ${status} = 'quoted' THEN COALESCE(quoted_at, NOW())
        ELSE quoted_at
      END,
      closed_at = CASE
        WHEN ${status} = 'closed' THEN COALESCE(closed_at, NOW())
        ELSE closed_at
      END,
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING
      id, company_name, contact_person, phone, email, estimated_pax,
      travel_type, preferred_date, notes, status, agent_notes, assigned_to,
      quoted_at, closed_at, created_at, updated_at
  `;
  return (rows[0] as CorporateInquiry) ?? null;
}

/**
 * Append-only agent note log.
 */
export async function appendCorporateInquiryAgentNote(
  id: number,
  note: string
): Promise<CorporateInquiry | null> {
  const rows = await sql`
    UPDATE corporate_inquiries SET
      agent_notes = CASE
        WHEN agent_notes IS NULL OR agent_notes = '' THEN ${note}
        ELSE agent_notes || E'\n---\n' || ${note}
      END,
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING
      id, company_name, contact_person, phone, email, estimated_pax,
      travel_type, preferred_date, notes, status, agent_notes, assigned_to,
      quoted_at, closed_at, created_at, updated_at
  `;
  return (rows[0] as CorporateInquiry) ?? null;
}

/**
 * Non-paginated export list with the same filters as listAdmin.
 * Called by: CSV export endpoint
 */
export async function listCorporateInquiriesForExport(opts: {
  status?: CorpStatus | "all";
  travel_type?: TravelType | "all";
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<CorporateInquiry[]> {
  const status = opts.status && opts.status !== "all" ? opts.status : null;
  const travelType =
    opts.travel_type && opts.travel_type !== "all" ? opts.travel_type : null;
  const search = opts.search?.trim() ? `%${opts.search.trim()}%` : null;
  const dateFrom = opts.dateFrom ?? null;
  const dateTo = opts.dateTo ?? null;

  const rows = await sql`
    SELECT
      id, company_name, contact_person, phone, email, estimated_pax,
      travel_type, preferred_date, notes, status, agent_notes, assigned_to,
      quoted_at, closed_at, created_at, updated_at
    FROM corporate_inquiries
    WHERE (${status}::text IS NULL OR status = ${status})
      AND (${travelType}::text IS NULL OR travel_type = ${travelType})
      AND (
        ${search}::text IS NULL
        OR company_name ILIKE ${search}
        OR contact_person ILIKE ${search}
        OR phone ILIKE ${search}
        OR email ILIKE ${search}
      )
      AND (${dateFrom}::date IS NULL OR created_at::date >= ${dateFrom}::date)
      AND (${dateTo}::date IS NULL OR created_at::date <= ${dateTo}::date)
    ORDER BY created_at DESC, id DESC
  `;
  return rows as CorporateInquiry[];
}
