import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { invalidate, CACHE_KEYS } from "@/lib/cache";
import { writeAuditLog } from "@/lib/queries/audit-logs";
import { createFaq, listFaqsAdmin } from "@/lib/queries/faqs";
import { sanitizeHtml } from "@/lib/sanitize";

const CONTENT_ROLES = ["super_admin", "admin", "editor"] as const;

const FAQ_CACHE_KEYS = [
  CACHE_KEYS.FAQ_GENERAL,
  CACHE_KEYS.FAQ_HALAL_TOUR,
  CACHE_KEYS.FAQ_KORPORAT,
];

const CreateSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
  category: z.enum(["general", "halal-tour", "korporat"]).optional(),
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

  const { rows, total } = await listFaqsAdmin({
    page,
    perPage: per_page,
    category:
      category === "general" ||
      category === "halal-tour" ||
      category === "korporat" ||
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

  const data = parsed.data;
  const result = await createFaq(
    { ...data, answer: sanitizeHtml(data.answer) },
    session.userId
  );

  await invalidate(...FAQ_CACHE_KEYS);

  await writeAuditLog({
    admin_user_id: session.userId,
    action: "created",
    entity_type: "faqs",
    entity_id: result.id,
    changed_fields: data,
  });

  return NextResponse.json(result, { status: 201 });
}
