import { requirePageRoles } from "@/lib/admin-guard";
import { TeamClient } from "@/components/admin/modules/TeamClient";

export default async function TeamPage() {
  await requirePageRoles(["super_admin", "admin", "editor"]);
  return <TeamClient />;
}
