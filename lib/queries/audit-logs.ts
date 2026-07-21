import { sql } from "@/lib/db";
import type { AuditAction, AuditLog, PaginatedResult } from "@/types/db";

export interface WriteAuditLogInput {
  admin_user_id: number | null;
  action: AuditAction;
  entity_type: string;
  entity_id?: number | null;
  changed_fields?: Record<string, unknown> | null;
  ip_address?: string | null;
  user_agent?: string | null;
}

export async function writeAuditLog(input: WriteAuditLogInput): Promise<void> {
  await sql`
    INSERT INTO audit_logs (
      admin_user_id, action, entity_type, entity_id,
      changed_fields, ip_address, user_agent
    )
    VALUES (
      ${input.admin_user_id},
      ${input.action},
      ${input.entity_type},
      ${input.entity_id ?? null},
      ${input.changed_fields ? JSON.stringify(input.changed_fields) : null},
      ${input.ip_address ?? null},
      ${input.user_agent ?? null}
    )
  `;
}

export interface AuditLogRow extends AuditLog {
  user_name: string | null;
  total_count?: number;
}

export async function listAuditLogs(
  page = 1,
  perPage = 25
): Promise<PaginatedResult<AuditLogRow>> {
  const offset = (page - 1) * perPage;
  const rows = await sql`
    SELECT
      a.id,
      a.admin_user_id,
      a.action,
      a.entity_type,
      a.entity_id,
      a.changed_fields,
      a.ip_address::text AS ip_address,
      a.user_agent,
      a.created_at,
      u.full_name AS user_name,
      COUNT(*) OVER() AS total_count
    FROM audit_logs a
    LEFT JOIN admin_users u ON u.id = a.admin_user_id
    ORDER BY a.created_at DESC
    LIMIT ${perPage}
    OFFSET ${offset}
  `;
  const total = rows.length > 0 ? Number((rows[0] as { total_count: number }).total_count) : 0;
  return {
    rows: rows.map(({ total_count: _, ...r }) => r as AuditLogRow),
    total,
  };
}

export async function listAllAuditLogsForExport(): Promise<AuditLogRow[]> {
  const rows = await sql`
    SELECT
      a.id,
      a.admin_user_id,
      a.action,
      a.entity_type,
      a.entity_id,
      a.changed_fields,
      a.ip_address::text AS ip_address,
      a.user_agent,
      a.created_at,
      u.full_name AS user_name
    FROM audit_logs a
    LEFT JOIN admin_users u ON u.id = a.admin_user_id
    ORDER BY a.created_at DESC
  `;
  return rows as AuditLogRow[];
}
