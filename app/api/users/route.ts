import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { writeAuditLog } from "@/lib/queries/audit-logs";
import { createAdminUser, listAdminUsers } from "@/lib/queries/admin-users";

const SUPER_ADMIN = ["super_admin"] as const;

const CreateSchema = z.object({
  full_name: z.string().min(1).max(120),
  email: z.string().email(),
  role: z.enum(["super_admin", "admin", "editor", "cs_agent"]),
  is_active: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  const session = await requireAuth(req, [...SUPER_ADMIN]);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const page = Math.max(1, Number(searchParams.get("page") ?? 1) || 1);
  const per_page = Math.min(100, Math.max(1, Number(searchParams.get("per_page") ?? 25) || 25));

  const { rows, total } = await listAdminUsers(page, per_page);
  return NextResponse.json({ data: rows, total, page, per_page });
}

export async function POST(req: NextRequest) {
  const session = await requireAuth(req, [...SUPER_ADMIN]);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 422 }
    );
  }

  const tempPassword = randomBytes(8).toString("base64url");
  const password_hash = await bcrypt.hash(tempPassword, 12);

  try {
    const user = await createAdminUser({
      full_name: parsed.data.full_name,
      email: parsed.data.email,
      password_hash,
      role: parsed.data.role,
      is_active: parsed.data.is_active,
    });

    await writeAuditLog({
      admin_user_id: session.userId,
      action: "created",
      entity_type: "admin_users",
      entity_id: user.id,
      changed_fields: {
        full_name: parsed.data.full_name,
        email: parsed.data.email,
        role: parsed.data.role,
      },
    });

    return NextResponse.json({ ...user, temp_password: tempPassword }, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("unique") || msg.includes("duplicate")) {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 });
    }
    throw e;
  }
}
