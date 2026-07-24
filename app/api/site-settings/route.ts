import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { invalidate, CACHE_KEYS } from "@/lib/cache";
import { writeAuditLog } from "@/lib/queries/audit-logs";
import { getSiteSettings, updateSiteSettings } from "@/lib/queries/site-settings";
import { extractYoutubeId } from "@/lib/hero-settings";

const SETTINGS_ROLES = ["super_admin", "admin"] as const;

const HeroSlideSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(600),
  image_url: z.string().url().nullable(),
});

const HeroAppearanceSchema = z
  .object({
    image_url: z.string().url().nullable(),
    background_color: z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/, "Use a 6-digit hex color"),
    media_type: z.enum(["image", "youtube", "video"]).optional().default("image"),
    video_url: z.string().nullable().optional(),
    slides: z.array(HeroSlideSchema).min(1).max(3).optional(),
  })
  .superRefine((value, ctx) => {
    const videoUrl = value.video_url?.trim() || null;

    if (value.media_type === "youtube") {
      if (!videoUrl || !extractYoutubeId(videoUrl)) {
        ctx.addIssue({
          code: "custom",
          path: ["video_url"],
          message: "Enter a valid YouTube URL or 11-character video ID",
        });
      }
      return;
    }

    if (value.media_type === "video") {
      if (!videoUrl) {
        ctx.addIssue({
          code: "custom",
          path: ["video_url"],
          message: "Upload a video or paste a direct video file URL",
        });
        return;
      }
      try {
        // eslint-disable-next-line no-new
        new URL(videoUrl);
      } catch {
        ctx.addIssue({
          code: "custom",
          path: ["video_url"],
          message: "Video file URL must be a valid URL",
        });
      }
    }
  })
  .transform((value) => ({
    ...value,
    video_url: value.video_url?.trim() || null,
  }));

const HomeHeroAppearanceSchema = HeroAppearanceSchema.superRefine((value, ctx) => {
  if (!value.slides || value.slides.length < 1) {
    ctx.addIssue({
      code: "custom",
      path: ["slides"],
      message: "Home hero needs at least 1 content slide",
    });
  }
});

const HeroSettingsSchema = z.object({
  home: HomeHeroAppearanceSchema.optional(),
  "paket-umroh": HeroAppearanceSchema.optional(),
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
  logo_url: z.string().url().nullable().optional(),
  logo_white_url: z.string().url().nullable().optional(),
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
  revalidatePath("/", "layout");
  for (const path of [
    "/",
    "/paket-umroh",
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
