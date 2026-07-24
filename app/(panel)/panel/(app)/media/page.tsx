import { requirePageRoles } from "@/lib/admin-guard";
import { MediaClient } from "@/components/admin/modules/MediaClient";

export default async function MediaPage() {
  await requirePageRoles(["super_admin", "admin", "editor"]);
  return <MediaClient />;
}
