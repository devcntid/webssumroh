import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { invalidate, CACHE_KEYS } from "@/lib/cache";
import { writeAuditLog } from "@/lib/queries/audit-logs";
import { reorderGalleryItems } from "@/lib/queries/gallery";

const CONTENT_ROLES = ["super_admin", "admin", "editor"] as const;

const ReorderSchema = z.object({
  ordered_ids: z.array(z.number().int().positive()).min(1),
});

export async function PATCH(req: NextRequest) {
  const session = await requireAuth(req, [...CONTENT_ROLES]);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = ReorderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 422 }
    );
  }

  await reorderGalleryItems(parsed.data.ordered_ids);
  await invalidate(
    CACHE_KEYS.GALLERY_UMROH,
    CACHE_KEYS.GALLERY_HALAL,
    CACHE_KEYS.GALLERY_KORPORAT,
    CACHE_KEYS.GALLERY_GENERAL
  );

  await writeAuditLog({
    admin_user_id: session.userId,
    action: "updated",
    entity_type: "gallery_items",
    changed_fields: { ordered_ids: parsed.data.ordered_ids },
  });

  return NextResponse.json({ ok: true });
}
