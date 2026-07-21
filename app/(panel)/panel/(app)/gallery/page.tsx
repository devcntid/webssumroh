import { requirePageRoles } from "@/lib/admin-guard";
import { GalleryClient } from "@/components/admin/modules/GalleryClient";

export default async function GalleryPage() {
  await requirePageRoles(["super_admin", "admin", "editor"]);
  return <GalleryClient />;
}
