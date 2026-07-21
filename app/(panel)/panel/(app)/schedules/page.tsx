import { requirePageRoles } from "@/lib/admin-guard";
import { SchedulesClient } from "@/components/admin/modules/SchedulesClient";

export default async function SchedulesPage() {
  await requirePageRoles(["super_admin", "admin", "editor"]);
  return <SchedulesClient />;
}
