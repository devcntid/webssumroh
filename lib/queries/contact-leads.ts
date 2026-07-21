import { sql } from "@/lib/db";
import type { ContactLead, LeadStatus, PaginatedResult } from "@/types/db";

/**
 * Paginated admin list of contact leads.
 * Called by: GET /api/leads (admin)
 * Never soft-deleted — compliance retention.
 */
export async function listContactLeadsAdmin(opts: {
  page?: number;
  perPage?: number;
  status?: LeadStatus | "all";
  page_source?: string | "all";
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<PaginatedResult<ContactLead>> {
  const page = opts.page ?? 1;
  const perPage = opts.perPage ?? 25;
  const offset = (page - 1) * perPage;
  const status = opts.status && opts.status !== "all" ? opts.status : null;
  const pageSource =
    opts.page_source && opts.page_source !== "all" ? opts.page_source : null;
  const search = opts.search?.trim() ? `%${opts.search.trim()}%` : null;
  const dateFrom = opts.dateFrom ?? null;
  const dateTo = opts.dateTo ?? null;

  const rows = await sql`
    SELECT
      id, full_name, phone, email, subject, message, page_source, status,
      agent_notes, assigned_to, responded_at, closed_at, created_at, updated_at,
      COUNT(*) OVER() AS total_count
    FROM contact_leads
    WHERE (${status}::text IS NULL OR status = ${status})
      AND (${pageSource}::text IS NULL OR page_source = ${pageSource})
      AND (
        ${search}::text IS NULL
        OR full_name ILIKE ${search}
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
    rows: rows.map(({ total_count: _, ...r }) => r as ContactLead),
    total,
  };
}

export async function getContactLeadById(id: number): Promise<ContactLead | null> {
  const rows = await sql`
    SELECT
      id, full_name, phone, email, subject, message, page_source, status,
      agent_notes, assigned_to, responded_at, closed_at, created_at, updated_at
    FROM contact_leads
    WHERE id = ${id}
    LIMIT 1
  `;
  return (rows[0] as ContactLead) ?? null;
}

export async function updateContactLeadStatus(
  id: number,
  status: LeadStatus,
  assignedTo?: number | null
): Promise<ContactLead | null> {
  const rows = await sql`
    UPDATE contact_leads SET
      status = ${status},
      assigned_to = COALESCE(${assignedTo ?? null}::bigint, assigned_to),
      responded_at = CASE
        WHEN ${status} = 'responded' THEN COALESCE(responded_at, NOW())
        ELSE responded_at
      END,
      closed_at = CASE
        WHEN ${status} = 'closed' THEN COALESCE(closed_at, NOW())
        ELSE closed_at
      END,
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING
      id, full_name, phone, email, subject, message, page_source, status,
      agent_notes, assigned_to, responded_at, closed_at, created_at, updated_at
  `;
  return (rows[0] as ContactLead) ?? null;
}

/**
 * Append-only agent note log.
 */
export async function appendContactLeadAgentNote(
  id: number,
  note: string
): Promise<ContactLead | null> {
  const rows = await sql`
    UPDATE contact_leads SET
      agent_notes = CASE
        WHEN agent_notes IS NULL OR agent_notes = '' THEN ${note}
        ELSE agent_notes || E'\n---\n' || ${note}
      END,
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING
      id, full_name, phone, email, subject, message, page_source, status,
      agent_notes, assigned_to, responded_at, closed_at, created_at, updated_at
  `;
  return (rows[0] as ContactLead) ?? null;
}

/**
 * Non-paginated export list with the same filters as listAdmin.
 * Called by: CSV export endpoint
 */
export async function listContactLeadsForExport(opts: {
  status?: LeadStatus | "all";
  page_source?: string | "all";
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<ContactLead[]> {
  const status = opts.status && opts.status !== "all" ? opts.status : null;
  const pageSource =
    opts.page_source && opts.page_source !== "all" ? opts.page_source : null;
  const search = opts.search?.trim() ? `%${opts.search.trim()}%` : null;
  const dateFrom = opts.dateFrom ?? null;
  const dateTo = opts.dateTo ?? null;

  const rows = await sql`
    SELECT
      id, full_name, phone, email, subject, message, page_source, status,
      agent_notes, assigned_to, responded_at, closed_at, created_at, updated_at
    FROM contact_leads
    WHERE (${status}::text IS NULL OR status = ${status})
      AND (${pageSource}::text IS NULL OR page_source = ${pageSource})
      AND (
        ${search}::text IS NULL
        OR full_name ILIKE ${search}
        OR phone ILIKE ${search}
        OR email ILIKE ${search}
      )
      AND (${dateFrom}::date IS NULL OR created_at::date >= ${dateFrom}::date)
      AND (${dateTo}::date IS NULL OR created_at::date <= ${dateTo}::date)
    ORDER BY created_at DESC, id DESC
  `;
  return rows as ContactLead[];
}
