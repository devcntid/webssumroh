import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { invalidate, CACHE_KEYS } from "@/lib/cache";
import { writeAuditLog } from "@/lib/queries/audit-logs";
import {
  createHalalPackage,
  listHalalPackagesAdmin,
} from "@/lib/queries/halal-packages";
import { sanitizeHtml } from "@/lib/sanitize";

const CONTENT_ROLES = ["super_admin", "admin", "editor"] as const;

const CreateSchema = z.object({
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

export async function GET(req: NextRequest) {
  const session = await requireAuth(req, [...CONTENT_ROLES]);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const page = Math.max(1, Number(searchParams.get("page") ?? 1) || 1);
  const per_page = Math.min(100, Math.max(1, Number(searchParams.get("per_page") ?? 25) || 25));
  const destinationIdRaw = searchParams.get("destination_id");
  const destinationId = destinationIdRaw ? Number(destinationIdRaw) : undefined;
  const statusParam = searchParams.get("status");
  const status =
    statusParam === "active" || statusParam === "inactive" || statusParam === "all"
      ? statusParam
      : "all";
  const search = searchParams.get("search") ?? undefined;

  const { rows, total } = await listHalalPackagesAdmin({
    page,
    perPage: per_page,
    destinationId:
      destinationId && Number.isFinite(destinationId) ? destinationId : undefined,
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
  const result = await createHalalPackage(
    {
      ...data,
      highlights_text: data.highlights_text
        ? sanitizeHtml(data.highlights_text)
        : data.highlights_text,
    },
    session.userId
  );

  await invalidate(CACHE_KEYS.HALAL_PKGS_ACTIVE);

  await writeAuditLog({
    admin_user_id: session.userId,
    action: "created",
    entity_type: "halal_packages",
    entity_id: result.id,
    changed_fields: data,
  });

  return NextResponse.json(result, { status: 201 });
}
