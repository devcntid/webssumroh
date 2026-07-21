import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { requireAuth } from "@/lib/auth";
import { listAllAuditLogsForExport } from "@/lib/queries/audit-logs";

const AUDIT_ROLES = ["super_admin", "admin"] as const;

export async function GET(req: NextRequest) {
  const session = await requireAuth(req, [...AUDIT_ROLES]);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const format = (req.nextUrl.searchParams.get("format") ?? "xlsx").toLowerCase();
  const rows = await listAllAuditLogsForExport();

  const exportRows = rows.map((r) => ({
    id: r.id,
    admin_user_id: r.admin_user_id,
    user_name: r.user_name,
    action: r.action,
    entity_type: r.entity_type,
    entity_id: r.entity_id,
    changed_fields: r.changed_fields ? JSON.stringify(r.changed_fields) : null,
    ip_address: r.ip_address,
    user_agent: r.user_agent,
    created_at: r.created_at,
  }));

  const ws = XLSX.utils.json_to_sheet(exportRows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Audit");

  if (format === "csv") {
    const csv = XLSX.utils.sheet_to_csv(ws);
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="audit-export.csv"',
      },
    });
  }

  const buffer = Buffer.from(XLSX.write(wb, { type: "buffer", bookType: "xlsx" }));
  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="audit-export.xlsx"',
    },
  });
}
