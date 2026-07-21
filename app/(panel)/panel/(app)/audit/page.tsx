import { requirePageRoles } from "@/lib/admin-guard";
import { AuditClient } from "@/components/admin/modules/AuditClient";

export default async function AuditPage() {
  await requirePageRoles(["super_admin", "admin"]);
  return <AuditClient />;
}
