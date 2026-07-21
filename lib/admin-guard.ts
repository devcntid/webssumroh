import { redirect } from "next/navigation";
import { getServerSession, ADMIN_AUTH_BYPASS, DEV_ADMIN_SESSION } from "@/lib/auth";
import type { AdminRole } from "@/types/db";
import type { SessionPayload } from "@/types/auth";

/**
 * Server-side role gate for panel pages.
 * When ADMIN_AUTH_BYPASS is on, uses a mock super_admin session.
 */
export async function requirePageRoles(
  allowed: AdminRole[]
): Promise<SessionPayload> {
  const session =
    (await getServerSession()) ?? (ADMIN_AUTH_BYPASS ? DEV_ADMIN_SESSION : null);
  if (!session) redirect("/panel/login");
  if (!allowed.includes(session.role)) redirect("/panel");
  return session;
}
