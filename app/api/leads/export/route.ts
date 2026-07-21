import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { requireAuth } from "@/lib/auth";
import { listContactLeadsForExport } from "@/lib/queries/contact-leads";
import type { LeadStatus } from "@/types/db";

const LEAD_ROLES = ["super_admin", "admin", "cs_agent"] as const;

export async function GET(req: NextRequest) {
  const session = await requireAuth(req, [...LEAD_ROLES]);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const format = (searchParams.get("format") ?? "xlsx").toLowerCase();
  const statusParam = searchParams.get("status");
  const status: LeadStatus | "all" =
    statusParam === "new" ||
    statusParam === "read" ||
    statusParam === "responded" ||
    statusParam === "closed" ||
    statusParam === "all"
      ? statusParam
      : "all";

  const rows = await listContactLeadsForExport({
    status,
    page_source: searchParams.get("page_source") ?? "all",
    search: searchParams.get("search") ?? undefined,
    dateFrom: searchParams.get("date_from") ?? undefined,
    dateTo: searchParams.get("date_to") ?? undefined,
  });

  const exportRows = rows.map((r) => ({
    id: r.id,
    full_name: r.full_name,
    phone: r.phone,
    email: r.email,
    subject: r.subject,
    message: r.message,
    page_source: r.page_source,
    status: r.status,
    agent_notes: r.agent_notes,
    assigned_to: r.assigned_to,
    responded_at: r.responded_at,
    closed_at: r.closed_at,
    created_at: r.created_at,
  }));

  const ws = XLSX.utils.json_to_sheet(exportRows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Leads");

  if (format === "csv") {
    const csv = XLSX.utils.sheet_to_csv(ws);
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="leads-export.csv"',
      },
    });
  }

  const buffer = Buffer.from(XLSX.write(wb, { type: "buffer", bookType: "xlsx" }));
  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="leads-export.xlsx"',
    },
  });
}
