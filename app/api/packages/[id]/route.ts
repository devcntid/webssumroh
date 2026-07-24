import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { invalidate, CACHE_KEYS } from "@/lib/cache";
import { writeAuditLog } from "@/lib/queries/audit-logs";
import {
  getPackageById,
  softDeletePackage,
  togglePackageField,
  updatePackage,
} from "@/lib/queries/packages";

const CONTENT_ROLES = ["super_admin", "admin", "editor"] as const;

const UpdatePackageSchema = z.object({
  slug: z.string().min(1).max(120),
  name: z.string().min(1).max(200),
  category: z.enum(["hemat", "bintang4", "tabungan", "ramadhan", "group"]),
  tag_line: z.string().max(300).nullable().optional(),
  description: z.string().nullable().optional(),
  detail_text: z.string().nullable().optional(),
  hotel_distance_m: z.number().int().nullable().optional(),
  flight_type: z.string().max(100).nullable().optional(),
  price_mode: z.enum(["contact", "number"]),
  price_idr: z.number().int().nullable().optional(),
  price_display_text: z.string().max(200).nullable().optional(),
  cover_image_url: z.string().url().nullable().optional(),
  is_featured: z.boolean().optional(),
  is_active: z.boolean().optional(),
  display_order: z.number().int().optional(),
});

const ToggleSchema = z.object({
  field: z.enum(["is_featured", "is_active"]),
  value: z.boolean(),
});

function parseId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function clientIp(req: NextRequest): string | null {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip");
  return ip || null;
}

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  const session = await requireAuth(req, [...CONTENT_ROLES]);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = parseId((await ctx.params).id);
  if (!id) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const data = await getPackageById(id);
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ data });
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  const session = await requireAuth(req, [...CONTENT_ROLES]);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = parseId((await ctx.params).id);
  if (!id) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = UpdatePackageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 422 }
    );
  }

  const data = parsed.data;
  try {
    const result = await updatePackage(
      id,
      {
        ...data,
        description: data.description?.trim() || null,
        detail_text: data.detail_text?.trim() || null,
      },
      session.userId
    );
    if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await invalidate(CACHE_KEYS.PACKAGES_ACTIVE, CACHE_KEYS.PACKAGES_FEATURED);

    await writeAuditLog({
      admin_user_id: session.userId,
      action: "updated",
      entity_type: "packages",
      entity_id: id,
      changed_fields: data,
      ip_address: clientIp(req),
      user_agent: req.headers.get("user-agent"),
    });

    return NextResponse.json({ data: result });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("unique") || msg.includes("duplicate")) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
    }
    throw e;
  }
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const session = await requireAuth(req, [...CONTENT_ROLES]);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = parseId((await ctx.params).id);
  if (!id) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = ToggleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 422 }
    );
  }

  const result = await togglePackageField(
    id,
    parsed.data.field,
    parsed.data.value,
    session.userId
  );
  if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await invalidate(CACHE_KEYS.PACKAGES_ACTIVE, CACHE_KEYS.PACKAGES_FEATURED);

  await writeAuditLog({
    admin_user_id: session.userId,
    action: "updated",
    entity_type: "packages",
    entity_id: id,
    changed_fields: parsed.data,
    ip_address: clientIp(req),
    user_agent: req.headers.get("user-agent"),
  });

  return NextResponse.json({ data: result });
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const session = await requireAuth(req, [...CONTENT_ROLES]);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = parseId((await ctx.params).id);
  if (!id) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const existing = await getPackageById(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    await softDeletePackage(id);
  } catch (e) {
    if (e instanceof Error && e.message === "PACKAGE_HAS_ACTIVE_DEPARTURES") {
      return NextResponse.json(
        { error: "Cannot delete: package has upcoming or ongoing departures" },
        { status: 409 }
      );
    }
    throw e;
  }

  await invalidate(CACHE_KEYS.PACKAGES_ACTIVE, CACHE_KEYS.PACKAGES_FEATURED);

  await writeAuditLog({
    admin_user_id: session.userId,
    action: "deleted",
    entity_type: "packages",
    entity_id: id,
    changed_fields: { slug: existing.slug },
    ip_address: clientIp(req),
    user_agent: req.headers.get("user-agent"),
  });

  return new NextResponse(null, { status: 204 });
}
