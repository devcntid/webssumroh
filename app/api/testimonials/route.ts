import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { invalidate, CACHE_KEYS } from "@/lib/cache";
import { writeAuditLog } from "@/lib/queries/audit-logs";
import {
  createTestimonial,
  listTestimonialsAdmin,
} from "@/lib/queries/testimonials";

const CONTENT_ROLES = ["super_admin", "admin", "editor"] as const;

const TESTIMONIAL_CACHE_KEYS = [
  CACHE_KEYS.TESTIMONIALS_GENERAL,
  CACHE_KEYS.TESTIMONIALS_HALAL,
  CACHE_KEYS.TESTIMONIALS_KORPORAT,
];

const CreateSchema = z.object({
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

export async function GET(req: NextRequest) {
  const session = await requireAuth(req, [...CONTENT_ROLES]);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const page = Math.max(1, Number(searchParams.get("page") ?? 1) || 1);
  const per_page = Math.min(100, Math.max(1, Number(searchParams.get("per_page") ?? 25) || 25));
  const pageContext = searchParams.get("page_context");
  const verified = searchParams.get("verified");
  const active = searchParams.get("active");

  const { rows, total } = await listTestimonialsAdmin({
    page,
    perPage: per_page,
    page_context:
      pageContext === "general" ||
      pageContext === "halal-tour" ||
      pageContext === "korporat" ||
      pageContext === "all"
        ? pageContext
        : "all",
    verified:
      verified === "yes" || verified === "no" || verified === "all" ? verified : "all",
    active: active === "yes" || active === "no" || active === "all" ? active : "all",
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

  const result = await createTestimonial(parsed.data, session.userId);
  await invalidate(...TESTIMONIAL_CACHE_KEYS);

  await writeAuditLog({
    admin_user_id: session.userId,
    action: "created",
    entity_type: "testimonials",
    entity_id: result.id,
    changed_fields: parsed.data,
  });

  return NextResponse.json(result, { status: 201 });
}
