import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { invalidate, CACHE_KEYS } from "@/lib/cache";
import { writeAuditLog } from "@/lib/queries/audit-logs";
import {
  createTeamMember,
  listTeamMembersAdmin,
} from "@/lib/queries/team-members";
import { sanitizeHtml } from "@/lib/sanitize";

const CONTENT_ROLES = ["super_admin", "admin", "editor"] as const;

const CreateSchema = z.object({
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

export async function GET(req: NextRequest) {
  const session = await requireAuth(req, [...CONTENT_ROLES]);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const page = Math.max(1, Number(searchParams.get("page") ?? 1) || 1);
  const per_page = Math.min(100, Math.max(1, Number(searchParams.get("per_page") ?? 25) || 25));
  const statusParam = searchParams.get("status");
  const status =
    statusParam === "active" || statusParam === "inactive" || statusParam === "all"
      ? statusParam
      : "all";
  const department = searchParams.get("department");

  const { rows, total } = await listTeamMembersAdmin({
    page,
    perPage: per_page,
    status,
    department:
      department === "Operations" ||
      department === "Marketing" ||
      department === "Customer Service" ||
      department === "Finance" ||
      department === "Management" ||
      department === "all"
        ? department
        : "all",
  });

  return NextResponse.json({ data: rows, total, page, per_page });
}

export async function POST(req: NextRequest) {
  const session = await requireAuth(req, [...CONTENT_ROLES]);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 422 }
    );
  }

  const data = parsed.data;
  const result = await createTeamMember(
    { ...data, bio: data.bio ? sanitizeHtml(data.bio) : data.bio },
    session.userId
  );

  await invalidate(CACHE_KEYS.TEAM_ACTIVE);

  await writeAuditLog({
    admin_user_id: session.userId,
    action: "created",
    entity_type: "team_members",
    entity_id: result.id,
    changed_fields: data,
  });

  return NextResponse.json(result, { status: 201 });
}
