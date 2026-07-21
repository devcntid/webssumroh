import { sql } from "@/lib/db";

/** Count new contact leads for sidebar badge. */
export async function countNewLeads(): Promise<number> {
  const rows = await sql`
    SELECT COUNT(*)::int AS count FROM contact_leads WHERE status = 'new'
  `;
  return Number((rows[0] as { count: number })?.count ?? 0);
}
