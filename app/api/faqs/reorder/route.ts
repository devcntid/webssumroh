import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { invalidate, CACHE_KEYS } from "@/lib/cache";
import { writeAuditLog } from "@/lib/queries/audit-logs";
import { reorderFaqs } from "@/lib/queries/faqs";

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

  await reorderFaqs(parsed.data.ordered_ids);
  await invalidate(
    CACHE_KEYS.FAQ_GENERAL,
    CACHE_KEYS.FAQ_HALAL_TOUR,
    CACHE_KEYS.FAQ_KORPORAT
  );

  await writeAuditLog({
    admin_user_id: session.userId,
    action: "updated",
    entity_type: "faqs",
    changed_fields: { ordered_ids: parsed.data.ordered_ids },
  });

  return NextResponse.json({ ok: true });
}
