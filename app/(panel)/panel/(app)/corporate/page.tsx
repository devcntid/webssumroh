import { requirePageRoles } from "@/lib/admin-guard";
import { CorporateClient } from "@/components/admin/modules/CorporateClient";

export default async function CorporatePage() {
  await requirePageRoles(["super_admin", "admin", "cs_agent"]);
  return <CorporateClient />;
}
