/** Default white logo — used on transparent/dark header before scroll. */
export const DEFAULT_LOGO_WHITE_URL =
  "https://ssumroh.id/wp-content/uploads/2023/01/Logo-Putih.png";

/**
 * Default color logo — used on scrolled white header, footer, and other sections.
 * Falls back to the white asset until a color logo is uploaded in Site settings.
 */
export const DEFAULT_LOGO_COLOR_URL = DEFAULT_LOGO_WHITE_URL;

/** @deprecated Use DEFAULT_LOGO_WHITE_URL or DEFAULT_LOGO_COLOR_URL */
export const DEFAULT_LOGO_URL = DEFAULT_LOGO_WHITE_URL;

export function resolveLogoColorUrl(logoUrl: string | null | undefined): string {
  const value = logoUrl?.trim();
  return value || DEFAULT_LOGO_COLOR_URL;
}

export function resolveLogoWhiteUrl(logoWhiteUrl: string | null | undefined): string {
  const value = logoWhiteUrl?.trim();
  return value || DEFAULT_LOGO_WHITE_URL;
}
