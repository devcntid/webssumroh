import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { invalidate, CACHE_KEYS } from "@/lib/cache";
import { writeAuditLog } from "@/lib/queries/audit-logs";
import {
  getTestimonialById,
  softDeleteTestimonial,
  updateTestimonial,
} from "@/lib/queries/testimonials";

const CONTENT_ROLES = ["super_admin", "admin", "editor"] as const;

const TESTIMONIAL_CACHE_KEYS = [
  CACHE_KEYS.TESTIMONIALS_GENERAL,
  CACHE_KEYS.TESTIMONIALS_HALAL,
  CACHE_KEYS.TESTIMONIALS_KORPORAT,
];

const UpdateSchema = z.object({
  full_name: z.string().min(1).max(120),
  initials: z.string().min(1).max(10),
  city_or_role: z.string().max(120).nullable().optional(),
  package_name: z.string().max(200).nullable().optional(),
  star_rating: z.number().int().min(1).max(5).optional(),
  quote_text: z.string().min(1),
  page_context: z.enum(["general", "halal-tour", "korporat"]).optional(),
  date_collected: z.string().nullable().optional(),
  is_verified: z.boolean().optional(),
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

  const data = await getTestimonialById(id);
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

  const result = await updateTestimonial(id, parsed.data, session.userId);
  if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await invalidate(...TESTIMONIAL_CACHE_KEYS);

  await writeAuditLog({
    admin_user_id: session.userId,
    action: "updated",
    entity_type: "testimonials",
    entity_id: id,
    changed_fields: parsed.data,
  });

  return NextResponse.json({ data: result });
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const session = await requireAuth(req, [...CONTENT_ROLES]);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = parseId((await ctx.params).id);
  if (!id) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const existing = await getTestimonialById(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await softDeleteTestimonial(id);
  await invalidate(...TESTIMONIAL_CACHE_KEYS);

  await writeAuditLog({
    admin_user_id: session.userId,
    action: "deleted",
    entity_type: "testimonials",
    entity_id: id,
  });

  return new NextResponse(null, { status: 204 });
}
