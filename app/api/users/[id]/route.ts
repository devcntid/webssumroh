import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { writeAuditLog } from "@/lib/queries/audit-logs";
import {
  getAdminUserById,
  softDeleteAdminUser,
  updateAdminUser,
} from "@/lib/queries/admin-users";

const SUPER_ADMIN = ["super_admin"] as const;

const UpdateSchema = z.object({
  full_name: z.string().min(1).max(120).optional(),
  email: z.string().email().optional(),
  role: z.enum(["super_admin", "admin", "editor", "cs_agent"]).optional(),
  is_active: z.boolean().optional(),
  password: z.string().min(8).optional(),
});

function parseId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  const session = await requireAuth(req, [...SUPER_ADMIN]);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = parseId((await ctx.params).id);
  if (!id) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const data = await getAdminUserById(id);
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ data });
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  const session = await requireAuth(req, [...SUPER_ADMIN]);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = parseId((await ctx.params).id);
  if (!id) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 422 }
    );
  }

  const { password, ...rest } = parsed.data;
  const password_hash = password ? await bcrypt.hash(password, 12) : undefined;

  try {
    const result = await updateAdminUser(id, {
      ...rest,
      password_hash,
    });
    if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await writeAuditLog({
      admin_user_id: session.userId,
      action: "updated",
      entity_type: "admin_users",
      entity_id: id,
      changed_fields: {
        ...rest,
        password_reset: Boolean(password),
      },
    });

    return NextResponse.json({ data: result });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("unique") || msg.includes("duplicate")) {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 });
    }
    throw e;
  }
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const session = await requireAuth(req, [...SUPER_ADMIN]);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = parseId((await ctx.params).id);
  if (!id) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (id === session.userId) {
    return NextResponse.json({ error: "Cannot delete your own account" }, { status: 409 });
  }

  const existing = await getAdminUserById(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await softDeleteAdminUser(id);

  await writeAuditLog({
    admin_user_id: session.userId,
    action: "deleted",
    entity_type: "admin_users",
    entity_id: id,
    changed_fields: { email: existing.email },
  });

  return new NextResponse(null, { status: 204 });
}
