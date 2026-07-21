import { requirePageRoles } from "@/lib/admin-guard";
import { HalalDestinationsClient } from "@/components/admin/modules/HalalDestinationsClient";

export default async function HalalDestinationsPage() {
  await requirePageRoles(["super_admin", "admin", "editor"]);
  return <HalalDestinationsClient />;
}
