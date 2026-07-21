import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getAdminUserById } from "@/lib/queries/admin-users";

export async function GET(req: NextRequest) {
  const session = await requireAuth(req, [
    "super_admin",
    "admin",
    "editor",
    "cs_agent",
  ]);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await getAdminUserById(session.userId);
  if (!user || !user.is_active) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ data: user });
}
