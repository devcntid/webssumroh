import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { invalidate, CACHE_KEYS } from "@/lib/cache";
import { writeAuditLog } from "@/lib/queries/audit-logs";
import {
  getHalalPackageById,
  softDeleteHalalPackage,
  updateHalalPackage,
} from "@/lib/queries/halal-packages";
import { sanitizeHtml } from "@/lib/sanitize";

const CONTENT_ROLES = ["super_admin", "admin", "editor"] as const;

const UpdateSchema = z.object({
  destination_id: z.number().int().positive(),
  name: z.string().min(1).max(200),
  tag_line: z.string().max(300).nullable().optional(),
  is_featured: z.boolean().optional(),
  seats_remaining: z.number().int().nullable().optional(),
  meta_chips: z.array(z.string()).optional(),
  highlights_text: z.string().nullable().optional(),
  price_display_text: z.string().max(200).nullable().optional(),
  price_idr: z.number().int().nullable().optional(),
  cover_image_url: z.string().url().nullable().optional(),
  departure_month: z.string().max(50).nullable().optional(),
  departure_date: z.string().nullable().optional(),
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

  const data = await getHalalPackageById(id);
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
  const result = await updateHalalPackage(
    id,
    {
      ...data,
      highlights_text: data.highlights_text
        ? sanitizeHtml(data.highlights_text)
        : data.highlights_text,
    },
    session.userId
  );
  if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await invalidate(CACHE_KEYS.HALAL_PKGS_ACTIVE);

  await writeAuditLog({
    admin_user_id: session.userId,
    action: "updated",
    entity_type: "halal_packages",
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

  const existing = await getHalalPackageById(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await softDeleteHalalPackage(id);
  await invalidate(CACHE_KEYS.HALAL_PKGS_ACTIVE);

  await writeAuditLog({
    admin_user_id: session.userId,
    action: "deleted",
    entity_type: "halal_packages",
    entity_id: id,
  });

  return new NextResponse(null, { status: 204 });
}
