import { requirePageRoles } from "@/lib/admin-guard";
import { TestimonialsClient } from "@/components/admin/modules/TestimonialsClient";

export default async function TestimonialsPage() {
  await requirePageRoles(["super_admin", "admin", "editor"]);
  return <TestimonialsClient />;
}
