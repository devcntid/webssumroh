import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { writeAuditLog } from "@/lib/queries/audit-logs";
import { createMediaAsset, listMediaAssets } from "@/lib/queries/media";

const CONTENT_ROLES = ["super_admin", "admin", "editor"] as const;

const CreateSchema = z.object({
  title: z.string().min(1).max(200),
  image_url: z.string().url(),
  alt_text: z.string().max(200).nullable().optional(),
  file_size_kb: z.number().int().nonnegative().nullable().optional(),
  width_px: z.number().int().positive().nullable().optional(),
  height_px: z.number().int().positive().nullable().optional(),
});

export async function GET(req: NextRequest) {
  const session = await requireAuth(req, [...CONTENT_ROLES]);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const page = Math.max(1, Number(searchParams.get("page") ?? 1) || 1);
  const per_page = Math.min(100, Math.max(1, Number(searchParams.get("per_page") ?? 25) || 25));
  const q = searchParams.get("q")?.trim() || undefined;

  const { rows, total } = await listMediaAssets({ page, perPage: per_page, q });
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

  const result = await createMediaAsset(
    {
      ...parsed.data,
      alt_text: parsed.data.alt_text ?? null,
    },
    session.userId
  );

  await writeAuditLog({
    admin_user_id: session.userId,
    action: "created",
    entity_type: "media_assets",
    entity_id: result.id,
    changed_fields: parsed.data,
  });

  return NextResponse.json(result, { status: 201 });
}
