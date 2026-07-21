import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { listAuditLogs } from "@/lib/queries/audit-logs";

const AUDIT_ROLES = ["super_admin", "admin"] as const;

export async function GET(req: NextRequest) {
  const session = await requireAuth(req, [...AUDIT_ROLES]);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const page = Math.max(1, Number(searchParams.get("page") ?? 1) || 1);
  const per_page = Math.min(100, Math.max(1, Number(searchParams.get("per_page") ?? 25) || 25));

  const { rows, total } = await listAuditLogs(page, per_page);
  return NextResponse.json({ data: rows, total, page, per_page });
}
