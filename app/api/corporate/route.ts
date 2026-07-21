import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { listCorporateInquiriesAdmin } from "@/lib/queries/corporate-inquiries";
import type { CorpStatus, TravelType } from "@/types/db";

const LEAD_ROLES = ["super_admin", "admin", "cs_agent"] as const;

export async function GET(req: NextRequest) {
  const session = await requireAuth(req, [...LEAD_ROLES]);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const page = Math.max(1, Number(searchParams.get("page") ?? 1) || 1);
  const per_page = Math.min(100, Math.max(1, Number(searchParams.get("per_page") ?? 25) || 25));
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

  const { rows, total } = await listCorporateInquiriesAdmin({
    page,
    perPage: per_page,
    status,
    travel_type,
    search: searchParams.get("search") ?? undefined,
    dateFrom: searchParams.get("date_from") ?? undefined,
    dateTo: searchParams.get("date_to") ?? undefined,
  });

  return NextResponse.json({ data: rows, total, page, per_page });
}
