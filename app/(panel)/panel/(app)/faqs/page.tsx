import { requirePageRoles } from "@/lib/admin-guard";
import { FaqsClient } from "@/components/admin/modules/FaqsClient";

export default async function FaqsPage() {
  await requirePageRoles(["super_admin", "admin", "editor"]);
  return <FaqsClient />;
}
