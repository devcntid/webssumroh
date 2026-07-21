import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { invalidate, CACHE_KEYS } from "@/lib/cache";
import { writeAuditLog } from "@/lib/queries/audit-logs";
import {
  createHalalDestination,
  listHalalDestinationsAdmin,
} from "@/lib/queries/halal-destinations";
import { sanitizeHtml } from "@/lib/sanitize";

const CONTENT_ROLES = ["super_admin", "admin", "editor"] as const;

const CreateSchema = z.object({
  country_name: z.string().min(1).max(100),
  flag_emoji: z.string().max(16).nullable().optional(),
  badge_label: z.string().max(100).nullable().optional(),
  description: z.string().nullable().optional(),
  duration_text: z.string().max(100).nullable().optional(),
  best_season: z.string().max(100).nullable().optional(),
  starting_price_text: z.string().max(100).nullable().optional(),
  cover_image_url: z.string().url().nullable().optional(),
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
  const search = searchParams.get("search") ?? undefined;

  const { rows, total } = await listHalalDestinationsAdmin({
    page,
    perPage: per_page,
    status,
    search,
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
  const result = await createHalalDestination(
    {
      ...data,
      description: data.description ? sanitizeHtml(data.description) : data.description,
    },
    session.userId
  );

  await invalidate(CACHE_KEYS.HALAL_DEST_ACTIVE);

  await writeAuditLog({
    admin_user_id: session.userId,
    action: "created",
    entity_type: "halal_destinations",
    entity_id: result.id,
    changed_fields: data,
  });

  return NextResponse.json(result, { status: 201 });
}
