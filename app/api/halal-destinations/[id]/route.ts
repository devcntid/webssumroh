import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { invalidate, CACHE_KEYS } from "@/lib/cache";
import { writeAuditLog } from "@/lib/queries/audit-logs";
import {
  getHalalDestinationById,
  softDeleteHalalDestination,
  updateHalalDestination,
} from "@/lib/queries/halal-destinations";
import { sanitizeHtml } from "@/lib/sanitize";

const CONTENT_ROLES = ["super_admin", "admin", "editor"] as const;

const UpdateSchema = z.object({
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

  const data = await getHalalDestinationById(id);
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
  const result = await updateHalalDestination(
    id,
    {
      ...data,
      description: data.description ? sanitizeHtml(data.description) : data.description,
    },
    session.userId
  );
  if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await invalidate(CACHE_KEYS.HALAL_DEST_ACTIVE);

  await writeAuditLog({
    admin_user_id: session.userId,
    action: "updated",
    entity_type: "halal_destinations",
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

  const existing = await getHalalDestinationById(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    await softDeleteHalalDestination(id);
  } catch (e) {
    if (e instanceof Error && e.message === "DESTINATION_HAS_PACKAGES") {
      return NextResponse.json(
        { error: "Cannot delete: destination has linked packages" },
        { status: 409 }
      );
    }
    throw e;
  }

  await invalidate(CACHE_KEYS.HALAL_DEST_ACTIVE);

  await writeAuditLog({
    admin_user_id: session.userId,
    action: "deleted",
    entity_type: "halal_destinations",
    entity_id: id,
  });

  return new NextResponse(null, { status: 204 });
}
