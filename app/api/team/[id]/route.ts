import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { invalidate, CACHE_KEYS } from "@/lib/cache";
import { writeAuditLog } from "@/lib/queries/audit-logs";
import {
  getTeamMemberById,
  softDeleteTeamMember,
  updateTeamMember,
} from "@/lib/queries/team-members";
import { sanitizeHtml } from "@/lib/sanitize";

const CONTENT_ROLES = ["super_admin", "admin", "editor"] as const;

const UpdateSchema = z.object({
  full_name: z.string().min(1).max(120),
  role_title: z.string().min(1).max(120),
  department: z
    .enum(["Operations", "Marketing", "Customer Service", "Finance", "Management"])
    .optional(),
  photo_url: z.string().url().nullable().optional(),
  bio: z.string().nullable().optional(),
  is_active: z.boolean().optional(),
  display_order: z.number().int().optional(),
});

function parseId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  const session = await requireAuth(req, [...CONTENT_ROLES]);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = parseId((await ctx.params).id);
  if (!id) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const data = await getTeamMemberById(id);
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ data });
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  const session = await requireAuth(req, [...CONTENT_ROLES]);
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

  const data = parsed.data;
  const result = await updateTeamMember(id, {
    ...data,
    bio: data.bio ? sanitizeHtml(data.bio) : data.bio,
  });
  if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await invalidate(CACHE_KEYS.TEAM_ACTIVE);

  await writeAuditLog({
    admin_user_id: session.userId,
    action: "updated",
    entity_type: "team_members",
    entity_id: id,
    changed_fields: data,
  });

  return NextResponse.json({ data: result });
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const session = await requireAuth(req, [...CONTENT_ROLES]);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = parseId((await ctx.params).id);
  if (!id) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const existing = await getTeamMemberById(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await softDeleteTeamMember(id);
  await invalidate(CACHE_KEYS.TEAM_ACTIVE);

  await writeAuditLog({
    admin_user_id: session.userId,
    action: "deleted",
    entity_type: "team_members",
    entity_id: id,
  });

  return new NextResponse(null, { status: 204 });
}
