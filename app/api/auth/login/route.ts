import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import {
  COOKIE_NAME,
  cookieOptions,
  createSession,
  signToken,
} from "@/lib/auth";
import { checkLoginRateLimit } from "@/lib/rate-limit";
import {
  findAdminByEmail,
  recordLoginFailure,
  recordLoginSuccess,
} from "@/lib/queries/admin-users";
import { writeAuditLog } from "@/lib/queries/audit-logs";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function clientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  const allowed = await checkLoginRateLimit(ip);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many login attempts. Try again in 15 minutes." },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = LoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 422 }
    );
  }

  const user = await findAdminByEmail(parsed.data.email);
  if (!user || !user.is_active) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  if (user.locked_until && new Date(user.locked_until) > new Date()) {
    return NextResponse.json(
      { error: "Account locked. Try again later." },
      { status: 423 }
    );
  }

  const ok = await bcrypt.compare(parsed.data.password, user.password_hash);
  if (!ok) {
    await recordLoginFailure(user.id);
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  await recordLoginSuccess(user.id);

  const payload = {
    userId: user.id,
    role: user.role,
    email: user.email,
    fullName: user.full_name,
  };

  const token = await signToken(payload);
  await createSession(token, payload);

  await writeAuditLog({
    admin_user_id: user.id,
    action: "login",
    entity_type: "admin_users",
    entity_id: user.id,
    changed_fields: { ip },
    ip_address: ip === "unknown" ? null : ip,
    user_agent: req.headers.get("user-agent"),
  });

  const res = NextResponse.json({
    user: {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
    },
  });

  res.cookies.set(COOKIE_NAME, token, cookieOptions());
  return res;
}
