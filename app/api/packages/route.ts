import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { invalidate, CACHE_KEYS } from "@/lib/cache";
import { writeAuditLog } from "@/lib/queries/audit-logs";
import {
  createPackage,
  listPackagesAdmin,
} from "@/lib/queries/packages";

const CONTENT_ROLES = ["super_admin", "admin", "editor"] as const;

const CreatePackageSchema = z.object({
  slug: z.string().min(1).max(120).optional(),
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

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function clientIp(req: NextRequest): string | null {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip");
  return ip || null;
}

export async function GET(req: NextRequest) {
  const session = await requireAuth(req, [...CONTENT_ROLES]);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const page = Math.max(1, Number(searchParams.get("page") ?? 1) || 1);
  const per_page = Math.min(100, Math.max(1, Number(searchParams.get("per_page") ?? 25) || 25));
  const category = searchParams.get("category") ?? undefined;
  const statusParam = searchParams.get("status");
  const status =
    statusParam === "active" || statusParam === "inactive" || statusParam === "all"
      ? statusParam
      : "all";
  const search = searchParams.get("search") ?? undefined;

  const { rows, total } = await listPackagesAdmin({
    page,
    perPage: per_page,
    category,
    status,
    search,
  });

  return NextResponse.json({ data: rows, total, page, per_page });
}

export async function POST(req: NextRequest) {
  const session = await requireAuth(req, [...CONTENT_ROLES]);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = CreatePackageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 422 }
    );
  }

  const data = parsed.data;
  const slug = data.slug?.trim() || slugify(data.name);
  if (!slug) {
    return NextResponse.json(
      { error: "Validation failed", issues: [{ path: ["slug"], message: "Invalid slug" }] },
      { status: 422 }
    );
  }

  try {
    const result = await createPackage(
      {
        ...data,
        slug,
        description: data.description?.trim() || null,
        detail_text: data.detail_text?.trim() || null,
      },
      session.userId
    );

    await invalidate(CACHE_KEYS.PACKAGES_ACTIVE, CACHE_KEYS.PACKAGES_FEATURED);

    await writeAuditLog({
      admin_user_id: session.userId,
      action: "created",
      entity_type: "packages",
      entity_id: result.id,
      changed_fields: data,
      ip_address: clientIp(req),
      user_agent: req.headers.get("user-agent"),
    });

    return NextResponse.json(result, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("unique") || msg.includes("duplicate")) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
    }
    throw e;
  }
}
