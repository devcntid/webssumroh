import { NextRequest, NextResponse } from "next/server";
import {
  COOKIE_NAME,
  COOKIE_PATH,
  destroySession,
  requireAuth,
  verifyToken,
} from "@/lib/auth";
import { writeAuditLog } from "@/lib/queries/audit-logs";

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const session = await requireAuth(req, [
    "super_admin",
    "admin",
    "editor",
    "cs_agent",
  ]);

  if (token) {
    await destroySession(token);
  }

  if (session) {
    await writeAuditLog({
      admin_user_id: session.userId,
      action: "logout",
      entity_type: "admin_users",
      entity_id: session.userId,
    });
  } else if (token) {
    const payload = await verifyToken(token);
    if (payload) {
      await writeAuditLog({
        admin_user_id: payload.userId,
        action: "logout",
        entity_type: "admin_users",
        entity_id: payload.userId,
      });
    }
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: COOKIE_PATH,
    maxAge: 0,
  });
  return res;
}
