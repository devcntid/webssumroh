import { requirePageRoles } from "@/lib/admin-guard";
import { PackagesClient } from "@/components/admin/modules/PackagesClient";

export default async function PackagesPage() {
  await requirePageRoles(["super_admin", "admin", "editor"]);
  return <PackagesClient />;
}
