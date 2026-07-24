import type { CSSProperties, ReactNode } from "react";
import { createElement } from "react";
import type {
  HeroAppearance,
  HeroMediaType,
  HeroPageKey,
  HeroSettings,
  HeroSlide,
  SiteSetting,
} from "@/types/db";

export const HERO_PAGES: ReadonlyArray<{
  key: HeroPageKey;
  label: string;
  route: string;
  /** Home supports background video (YouTube or uploaded file). */
  supportsVideo?: boolean;
  /** Home supports editable content slides (title, description, side image). */
  supportsSlides?: boolean;
}> = [
  { key: "home", label: "Home", route: "/", supportsVideo: true, supportsSlides: true },
  { key: "paket-umroh", label: "Umroh", route: "/paket-umroh" },
  { key: "korporat", label: "Korporat", route: "/korporat" },
  { key: "destinasi", label: "Destinasi", route: "/destinasi" },
  { key: "tentang-kami", label: "Tentang Kami", route: "/tentang-kami" },
  { key: "kontak", label: "Kontak", route: "/kontak" },
  { key: "tim", label: "Tim Manajemen", route: "/tim" },
  { key: "privacy", label: "Privacy Policy", route: "/privacy" },
  { key: "terms", label: "Terms & Services", route: "/terms" },
] as const;

export const DEFAULT_HERO_COLOR = "#1A0533";

export const DEFAULT_HOME_SLIDE_IMAGE =
  "https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=900&h=1120&q=80";

export const DEFAULT_HOME_SLIDES: HeroSlide[] = [
  {
    title: "Wujudkan Umroh yang *Khusyuk*, Nyaman & Penuh Berkah",
    description:
      "PT. Sarana Sadaya (SS Umroh) mendampingi perjalanan ibadah Anda dengan hotel dekat masjid, direct flight, dan bimbingan ustadz berpengalaman — amanah sejak 2012.",
    image_url: DEFAULT_HOME_SLIDE_IMAGE,
  },
];

const MAX_HOME_SLIDES = 3;

export function normalizeHeroSlide(
  value?: Partial<HeroSlide> | null,
  fallback: HeroSlide = DEFAULT_HOME_SLIDES[0]
): HeroSlide {
  const title = typeof value?.title === "string" ? value.title.trim() : "";
  const description =
    typeof value?.description === "string" ? value.description.trim() : "";
  const imageUrl =
    typeof value?.image_url === "string" && value.image_url.trim()
      ? value.image_url.trim()
      : null;

  return {
    title: title || fallback.title,
    description: description || fallback.description,
    image_url: imageUrl ?? fallback.image_url,
  };
}

/** Normalize 1–3 home content slides; empty input falls back to defaults. */
export function normalizeHomeSlides(
  value?: HeroSlide[] | null
): HeroSlide[] {
  const source = Array.isArray(value) ? value.slice(0, MAX_HOME_SLIDES) : [];
  if (source.length === 0) {
    return DEFAULT_HOME_SLIDES.map((slide) => ({ ...slide }));
  }
  return source.map((slide, index) =>
    normalizeHeroSlide(slide, DEFAULT_HOME_SLIDES[Math.min(index, DEFAULT_HOME_SLIDES.length - 1)])
  );
}

export function normalizeHeroAppearance(
  value?: Partial<HeroAppearance> | null,
  options?: { includeSlides?: boolean }
): HeroAppearance {
  const mediaType: HeroMediaType =
    value?.media_type === "youtube" || value?.media_type === "video"
      ? value.media_type
      : "image";

  const base: HeroAppearance = {
    image_url: value?.image_url ?? null,
    background_color: value?.background_color ?? DEFAULT_HERO_COLOR,
    media_type: mediaType,
    video_url: value?.video_url ?? null,
  };

  if (options?.includeSlides) {
    base.slides = normalizeHomeSlides(value?.slides);
  }

  return base;
}

/**
 * Render title with optional *emphasis* markers as gold `<em>` spans.
 * Example: "Umroh yang *Khusyuk*" → Umroh yang <em>Khusyuk</em>
 */
export function formatHeroTitle(title: string): ReactNode[] {
  const parts = title.split(/(\*[^*]+\*)/g).filter(Boolean);
  return parts.map((part, index) => {
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return createElement("em", { key: index }, part.slice(1, -1));
    }
    return createElement("span", { key: index }, part);
  });
}

export function normalizeHeroSettings(
  value?: HeroSettings | null
): Record<HeroPageKey, HeroAppearance> {
  const normalized = {} as Record<HeroPageKey, HeroAppearance>;
  for (const page of HERO_PAGES) {
    normalized[page.key] = normalizeHeroAppearance(value?.[page.key], {
      includeSlides: Boolean(page.supportsSlides),
    });
  }
  return normalized;
}

export function resolveHeroAppearance(
  settings: SiteSetting | null,
  page: HeroPageKey,
  fallbackImage: string | null
): HeroAppearance {
  const pageMeta = HERO_PAGES.find((item) => item.key === page);
  const configured = normalizeHeroAppearance(settings?.hero_settings?.[page], {
    includeSlides: Boolean(pageMeta?.supportsSlides),
  });
  return {
    ...configured,
    image_url: configured.image_url || fallbackImage,
  };
}

export function resolveHomeSlides(settings: SiteSetting | null): HeroSlide[] {
  return normalizeHomeSlides(settings?.hero_settings?.home?.slides);
}

export function heroSectionStyle(hero: HeroAppearance): CSSProperties {
  return {
    "--hero-color": hero.background_color,
    backgroundColor: hero.background_color,
  } as CSSProperties;
}

export function heroBackgroundStyle(hero: HeroAppearance): CSSProperties {
  // Keep image as CSS fallback / poster even when YouTube or file video is active.
  return hero.image_url ? { backgroundImage: `url(${hero.image_url})` } : {};
}

/** Extract a YouTube video ID from common URL formats or a bare ID. */
export function extractYoutubeId(input: string | null | undefined): string | null {
  if (!input) return null;
  const value = input.trim();
  if (!value) return null;

  if (/^[a-zA-Z0-9_-]{11}$/.test(value)) return value;

  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return id && /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
    }

    if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
      const v = url.searchParams.get("v");
      if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;

      const parts = url.pathname.split("/").filter(Boolean);
      const embedIdx = parts.findIndex((p) => p === "embed" || p === "shorts" || p === "live");
      if (embedIdx >= 0 && parts[embedIdx + 1] && /^[a-zA-Z0-9_-]{11}$/.test(parts[embedIdx + 1])) {
        return parts[embedIdx + 1];
      }
    }
  } catch {
    return null;
  }

  return null;
}

export function youtubeBackgroundEmbedUrl(videoId: string): string {
  const params = new URLSearchParams({
    autoplay: "1",
    mute: "1",
    controls: "0",
    playsinline: "1",
    loop: "1",
    playlist: videoId,
    modestbranding: "1",
    rel: "0",
    showinfo: "0",
    iv_load_policy: "3",
    disablekb: "1",
    fs: "0",
  });
  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
}
