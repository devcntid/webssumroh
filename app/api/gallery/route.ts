import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { invalidate, CACHE_KEYS } from "@/lib/cache";
import { writeAuditLog } from "@/lib/queries/audit-logs";
import { createGalleryItem, listGalleryAdmin } from "@/lib/queries/gallery";

const CONTENT_ROLES = ["super_admin", "admin", "editor"] as const;

const GALLERY_CACHE_KEYS = [
  CACHE_KEYS.GALLERY_UMROH,
  CACHE_KEYS.GALLERY_HALAL,
  CACHE_KEYS.GALLERY_KORPORAT,
  CACHE_KEYS.GALLERY_GENERAL,
];

const CreateSchema = z.object({
  image_url: z.string().url(),
  thumbnail_url: z.string().url().nullable().optional(),
  alt_text: z.string().min(1).max(300),
  caption: z.string().max(500).nullable().optional(),
  category: z.enum(["umroh", "halal-tour", "korporat", "general"]).optional(),
  file_size_kb: z.number().int().nullable().optional(),
  width_px: z.number().int().nullable().optional(),
  height_px: z.number().int().nullable().optional(),
  is_active: z.boolean().optional(),
  display_order: z.number().int().optional(),
});

export async function GET(req: NextRequest) {
  const session = await requireAuth(req, [...CONTENT_ROLES]);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const page = Math.max(1, Number(searchParams.get("page") ?? 1) || 1);
  const per_page = Math.min(100, Math.max(1, Number(searchParams.get("per_page") ?? 25) || 25));
  const category = searchParams.get("category");
  const statusParam = searchParams.get("status");
  const status =
    statusParam === "active" || statusParam === "inactive" || statusParam === "all"
      ? statusParam
      : "all";

  const { rows, total } = await listGalleryAdmin({
    page,
    perPage: per_page,
    category:
      category === "umroh" ||
      category === "halal-tour" ||
      category === "korporat" ||
      category === "general" ||
      category === "all"
        ? category
        : "all",
    status,
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

  const result = await createGalleryItem(parsed.data, session.userId);
  await invalidate(...GALLERY_CACHE_KEYS);

  await writeAuditLog({
    admin_user_id: session.userId,
    action: "created",
    entity_type: "gallery_items",
    entity_id: result.id,
    changed_fields: parsed.data,
  });

  return NextResponse.json(result, { status: 201 });
}
