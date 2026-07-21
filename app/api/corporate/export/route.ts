import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { requireAuth } from "@/lib/auth";
import { listCorporateInquiriesForExport } from "@/lib/queries/corporate-inquiries";
import type { CorpStatus, TravelType } from "@/types/db";

const LEAD_ROLES = ["super_admin", "admin", "cs_agent"] as const;

export async function GET(req: NextRequest) {
  const session = await requireAuth(req, [...LEAD_ROLES]);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const format = (searchParams.get("format") ?? "xlsx").toLowerCase();
  const statusParam = searchParams.get("status");
  const status: CorpStatus | "all" =
    statusParam === "new" ||
    statusParam === "read" ||
    statusParam === "responded" ||
    statusParam === "quoted" ||
    statusParam === "closed" ||
    statusParam === "all"
      ? statusParam
      : "all";
  const travelParam = searchParams.get("travel_type");
  const travel_type: TravelType | "all" =
    travelParam === "umroh" ||
    travelParam === "halal-tour" ||
    travelParam === "both" ||
    travelParam === "all"
      ? travelParam
      : "all";

  const rows = await listCorporateInquiriesForExport({
    status,
    travel_type,
    search: searchParams.get("search") ?? undefined,
    dateFrom: searchParams.get("date_from") ?? undefined,
    dateTo: searchParams.get("date_to") ?? undefined,
  });

  const exportRows = rows.map((r) => ({
    id: r.id,
    company_name: r.company_name,
    contact_person: r.contact_person,
    phone: r.phone,
    email: r.email,
    estimated_pax: r.estimated_pax,
    travel_type: r.travel_type,
    preferred_date: r.preferred_date,
    notes: r.notes,
    status: r.status,
    agent_notes: r.agent_notes,
    assigned_to: r.assigned_to,
    quoted_at: r.quoted_at,
    closed_at: r.closed_at,
    created_at: r.created_at,
  }));

  const ws = XLSX.utils.json_to_sheet(exportRows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Corporate");

  if (format === "csv") {
    const csv = XLSX.utils.sheet_to_csv(ws);
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="corporate-export.csv"',
      },
    });
  }

  const buffer = Buffer.from(XLSX.write(wb, { type: "buffer", bookType: "xlsx" }));
  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="corporate-export.xlsx"',
    },
  });
}
