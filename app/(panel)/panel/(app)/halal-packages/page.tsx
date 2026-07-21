import { requirePageRoles } from "@/lib/admin-guard";
import { HalalPackagesClient } from "@/components/admin/modules/HalalPackagesClient";

export default async function HalalPackagesPage() {
  await requirePageRoles(["super_admin", "admin", "editor"]);
  return <HalalPackagesClient />;
}
