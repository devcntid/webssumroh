import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { invalidate, CACHE_KEYS } from "@/lib/cache";
import { writeAuditLog } from "@/lib/queries/audit-logs";
import { getFaqById, softDeleteFaq, updateFaq } from "@/lib/queries/faqs";
import { sanitizeHtml } from "@/lib/sanitize";

const CONTENT_ROLES = ["super_admin", "admin", "editor"] as const;

const FAQ_CACHE_KEYS = [
  CACHE_KEYS.FAQ_GENERAL,
  CACHE_KEYS.FAQ_HALAL_TOUR,
  CACHE_KEYS.FAQ_KORPORAT,
];

const UpdateSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
  category: z.enum(["general", "halal-tour", "korporat"]).optional(),
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

  const data = await getFaqById(id);
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
  const result = await updateFaq(
    id,
    { ...data, answer: sanitizeHtml(data.answer) },
    session.userId
  );
  if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await invalidate(...FAQ_CACHE_KEYS);

  await writeAuditLog({
    admin_user_id: session.userId,
    action: "updated",
    entity_type: "faqs",
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

  const existing = await getFaqById(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await softDeleteFaq(id);
  await invalidate(...FAQ_CACHE_KEYS);

  await writeAuditLog({
    admin_user_id: session.userId,
    action: "deleted",
    entity_type: "faqs",
    entity_id: id,
  });

  return new NextResponse(null, { status: 204 });
}
