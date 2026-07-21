import { requirePageRoles } from "@/lib/admin-guard";
import { CorporateDetailClient } from "@/components/admin/modules/CorporateDetailClient";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ id: string }> };

export default async function CorporateDetailPage({ params }: Props) {
  await requirePageRoles(["super_admin", "admin", "cs_agent"]);
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();
  return <CorporateDetailClient id={id} />;
}
