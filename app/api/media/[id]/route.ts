import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { writeAuditLog } from "@/lib/queries/audit-logs";
import {
  getMediaAssetById,
  softDeleteMediaAsset,
  updateMediaAsset,
} from "@/lib/queries/media";

const CONTENT_ROLES = ["super_admin", "admin", "editor"] as const;

const UpdateSchema = z.object({
  title: z.string().min(1).max(200),
  image_url: z.string().url(),
  alt_text: z.string().max(200).nullable().optional(),
  file_size_kb: z.number().int().nonnegative().nullable().optional(),
  width_px: z.number().int().positive().nullable().optional(),
  height_px: z.number().int().positive().nullable().optional(),
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

  const data = await getMediaAssetById(id);
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

  const result = await updateMediaAsset(
    id,
    {
      ...parsed.data,
      alt_text: parsed.data.alt_text ?? null,
    },
    session.userId
  );
  if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await writeAuditLog({
    admin_user_id: session.userId,
    action: "updated",
    entity_type: "media_assets",
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

  const existing = await getMediaAssetById(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await softDeleteMediaAsset(id);

  await writeAuditLog({
    admin_user_id: session.userId,
    action: "deleted",
    entity_type: "media_assets",
    entity_id: id,
  });

  return new NextResponse(null, { status: 204 });
}
