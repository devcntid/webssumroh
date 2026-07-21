import type { CSSProperties } from "react";
import type {
  HeroAppearance,
  HeroPageKey,
  HeroSettings,
  SiteSetting,
} from "@/types/db";

export const HERO_PAGES: ReadonlyArray<{
  key: HeroPageKey;
  label: string;
  route: string;
}> = [
  { key: "home", label: "Home", route: "/" },
  { key: "paket-umroh", label: "Umroh", route: "/paket-umroh" },
  { key: "halal-tour", label: "Halal Tour", route: "/halal-tour" },
  { key: "korporat", label: "Korporat", route: "/korporat" },
  { key: "destinasi", label: "Destinasi", route: "/destinasi" },
  { key: "tentang-kami", label: "Tentang Kami", route: "/tentang-kami" },
  { key: "kontak", label: "Kontak", route: "/kontak" },
  { key: "tim", label: "Tim Manajemen", route: "/tim" },
  { key: "privacy", label: "Privacy Policy", route: "/privacy" },
  { key: "terms", label: "Terms & Services", route: "/terms" },
] as const;

export const DEFAULT_HERO_COLOR = "#1A0533";

export function normalizeHeroSettings(
  value?: HeroSettings | null
): Record<HeroPageKey, HeroAppearance> {
  const normalized = {} as Record<HeroPageKey, HeroAppearance>;
  for (const page of HERO_PAGES) {
    const current = value?.[page.key];
    normalized[page.key] = {
      image_url: current?.image_url ?? null,
      background_color: current?.background_color ?? DEFAULT_HERO_COLOR,
    };
  }
  return normalized;
}

export function resolveHeroAppearance(
  settings: SiteSetting | null,
  page: HeroPageKey,
  fallbackImage: string | null
): HeroAppearance {
  const configured = settings?.hero_settings?.[page];
  return {
    image_url: configured?.image_url || fallbackImage,
    background_color: configured?.background_color || DEFAULT_HERO_COLOR,
  };
}

export function heroSectionStyle(hero: HeroAppearance): CSSProperties {
  return {
    "--hero-color": hero.background_color,
    backgroundColor: hero.background_color,
  } as CSSProperties;
}

export function heroBackgroundStyle(hero: HeroAppearance): CSSProperties {
  return hero.image_url ? { backgroundImage: `url(${hero.image_url})` } : {};
}
