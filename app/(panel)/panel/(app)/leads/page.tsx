import { requirePageRoles } from "@/lib/admin-guard";
import { LeadsClient } from "@/components/admin/modules/LeadsClient";

export default async function LeadsPage() {
  await requirePageRoles(["super_admin", "admin", "cs_agent"]);
  return <LeadsClient />;
}
