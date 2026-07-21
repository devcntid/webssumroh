import { requirePageRoles } from "@/lib/admin-guard";
import { SettingsClient } from "@/components/admin/modules/SettingsClient";

export default async function SettingsPage() {
  await requirePageRoles(["super_admin", "admin"]);
  return <SettingsClient />;
}
