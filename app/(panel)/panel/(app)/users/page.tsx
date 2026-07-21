import { requirePageRoles } from "@/lib/admin-guard";
import { UsersClient } from "@/components/admin/modules/UsersClient";

export default async function UsersPage() {
  await requirePageRoles(["super_admin"]);
  return <UsersClient />;
}
