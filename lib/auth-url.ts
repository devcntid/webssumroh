/**
 * Resolve the canonical public site URL for NextAuth.
 *
 * Google OAuth fails with ?error=OAuthCallback when NEXTAUTH_URL points at
 * *.vercel.app while users sign in on the custom domain (ssumroh.id).
 *
 * Priority:
 * 1. NEXT_PUBLIC_BASE_URL when it is a real public https host
 * 2. Existing NEXTAUTH_URL when it is already a non-local, non-vercel.app host
 * 3. Vercel production / deployment host as last resort
 *
 * Kept in a tiny module so Edge middleware can import it without pulling Neon/DB.
 */
export function ensureNextAuthUrl(): void {
  const publicBase = normalizeOrigin(process.env.NEXT_PUBLIC_BASE_URL);
  const current = normalizeOrigin(process.env.NEXTAUTH_URL);
  const onVercel = process.env.VERCEL === "1" || Boolean(process.env.VERCEL_URL);

  if (publicBase && isPublicProductionOrigin(publicBase)) {
    const currentNeedsReplace =
      !current ||
      isLocalOrigin(current) ||
      (onVercel && isVercelAppOrigin(current) && !isVercelAppOrigin(publicBase));

    if (currentNeedsReplace) {
      process.env.NEXTAUTH_URL = publicBase;
      return;
    }
  }

  if (current && !isLocalOrigin(current)) {
    process.env.NEXTAUTH_URL = current;
    return;
  }

  if (!onVercel) return;

  const host =
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL ||
    "";

  if (!host) return;
  process.env.NEXTAUTH_URL = host.startsWith("http") ? host.replace(/\/$/, "") : `https://${host}`;
}

function normalizeOrigin(value?: string | null): string {
  if (!value) return "";
  const trimmed = value.trim().replace(/\/$/, "");
  if (!trimmed) return "";
  try {
    const url = new URL(trimmed.includes("://") ? trimmed : `https://${trimmed}`);
    return `${url.protocol}//${url.host}`;
  } catch {
    return "";
  }
}

function isLocalOrigin(origin: string): boolean {
  try {
    const host = new URL(origin).hostname;
    return host === "localhost" || host === "127.0.0.1";
  } catch {
    return true;
  }
}

function isVercelAppOrigin(origin: string): boolean {
  try {
    return new URL(origin).hostname.endsWith(".vercel.app");
  } catch {
    return false;
  }
}

function isPublicProductionOrigin(origin: string): boolean {
  try {
    const url = new URL(origin);
    return url.protocol === "https:" && !isLocalOrigin(origin);
  } catch {
    return false;
  }
}
