import { requirePageRoles } from "@/lib/admin-guard";
import { LeadDetailClient } from "@/components/admin/modules/LeadDetailClient";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ id: string }> };

export default async function LeadDetailPage({ params }: Props) {
  await requirePageRoles(["super_admin", "admin", "cs_agent"]);
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();
  return <LeadDetailClient id={id} />;
}
