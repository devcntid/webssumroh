import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getDashboardStats } from "@/lib/queries/dashboard";

const ALL_ROLES = ["super_admin", "admin", "editor", "cs_agent"] as const;

export async function GET(req: NextRequest) {
  const session = await requireAuth(req, [...ALL_ROLES]);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await getDashboardStats();
  return NextResponse.json({ data });
}
