import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { invalidate, CACHE_KEYS } from "@/lib/cache";
import { writeAuditLog } from "@/lib/queries/audit-logs";
import { getSiteSettings, updateSiteSettings } from "@/lib/queries/site-settings";

const SETTINGS_ROLES = ["super_admin", "admin"] as const;

const HeroAppearanceSchema = z.object({
  image_url: z.string().url().nullable(),
  background_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Use a 6-digit hex color"),
});

const HeroSettingsSchema = z.object({
  home: HeroAppearanceSchema.optional(),
  "paket-umroh": HeroAppearanceSchema.optional(),
  "halal-tour": HeroAppearanceSchema.optional(),
  korporat: HeroAppearanceSchema.optional(),
  destinasi: HeroAppearanceSchema.optional(),
  "tentang-kami": HeroAppearanceSchema.optional(),
  kontak: HeroAppearanceSchema.optional(),
  tim: HeroAppearanceSchema.optional(),
  privacy: HeroAppearanceSchema.optional(),
  terms: HeroAppearanceSchema.optional(),
});

const UpdateSchema = z.object({
  phone_display: z.string().min(1).max(50),
  whatsapp_number: z.string().min(1).max(30),
  office_address: z.string().min(1),
  cs_name: z.string().min(1).max(100),
  ppiu_license: z.string().min(1).max(100),
  maps_embed_url: z.string().url().nullable().optional(),
  hero_settings: HeroSettingsSchema,
});

export async function GET(req: NextRequest) {
  const session = await requireAuth(req, [...SETTINGS_ROLES]);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await getSiteSettings();
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ data });
}

export async function PUT(req: NextRequest) {
  const session = await requireAuth(req, [...SETTINGS_ROLES]);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 422 }
    );
  }

  const result = await updateSiteSettings(parsed.data, session.userId);
  if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await invalidate(CACHE_KEYS.SITE_SETTINGS);
  for (const path of [
    "/",
    "/paket-umroh",
    "/halal-tour",
    "/korporat",
    "/destinasi",
    "/tentang-kami",
    "/kontak",
    "/tim",
    "/privacy",
    "/terms",
  ]) {
    revalidatePath(path);
  }

  await writeAuditLog({
    admin_user_id: session.userId,
    action: "updated",
    entity_type: "site_settings",
    entity_id: result.id,
    changed_fields: parsed.data,
  });

  return NextResponse.json({ data: result });
}
