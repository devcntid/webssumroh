import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { invalidate, CACHE_KEYS } from "@/lib/cache";
import { writeAuditLog } from "@/lib/queries/audit-logs";
import {
  getGalleryItemById,
  softDeleteGalleryItem,
  updateGalleryItem,
} from "@/lib/queries/gallery";

const CONTENT_ROLES = ["super_admin", "admin", "editor"] as const;

const GALLERY_CACHE_KEYS = [
  CACHE_KEYS.GALLERY_UMROH,
  CACHE_KEYS.GALLERY_HALAL,
  CACHE_KEYS.GALLERY_KORPORAT,
  CACHE_KEYS.GALLERY_GENERAL,
];

const UpdateSchema = z.object({
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

  const data = await getGalleryItemById(id);
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

  const result = await updateGalleryItem(id, parsed.data);
  if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await invalidate(...GALLERY_CACHE_KEYS);

  await writeAuditLog({
    admin_user_id: session.userId,
    action: "updated",
    entity_type: "gallery_items",
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

  const existing = await getGalleryItemById(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await softDeleteGalleryItem(id);
  await invalidate(...GALLERY_CACHE_KEYS);

  await writeAuditLog({
    admin_user_id: session.userId,
    action: "deleted",
    entity_type: "gallery_items",
    entity_id: id,
  });

  return new NextResponse(null, { status: 204 });
}
