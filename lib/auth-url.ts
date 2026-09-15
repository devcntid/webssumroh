/**
 * On Vercel, a leftover NEXTAUTH_URL=http://localhost:3000 breaks Google OAuth
 * and surfaces as ?error=OAuthCallback. Prefer the production host instead.
 *
 * Kept in a tiny module so Edge middleware can import it without pulling Neon/DB.
 */
export function ensureNextAuthUrl(): void {
  const current = process.env.NEXTAUTH_URL ?? "";
  const looksLocal = !current || /localhost|127\.0\.0\.1/i.test(current);
  const onVercel = process.env.VERCEL === "1" || Boolean(process.env.VERCEL_URL);

  if (!onVercel || !looksLocal) return;

  const host =
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL ||
    "";

  if (!host) return;
  process.env.NEXTAUTH_URL = host.startsWith("http") ? host : `https://${host}`;
}
