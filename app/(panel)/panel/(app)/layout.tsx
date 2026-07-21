import { getServerSession, ADMIN_AUTH_BYPASS, DEV_ADMIN_SESSION } from "@/lib/auth";
import { AdminShell } from "@/components/admin/layout/AdminShell";
import { countNewLeads } from "@/lib/queries/leads-count";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function PanelAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = (await getServerSession()) ?? (ADMIN_AUTH_BYPASS ? DEV_ADMIN_SESSION : null);
  if (!session) redirect("/panel/login");

  let newLeadsCount = 0;
  try {
    newLeadsCount = await countNewLeads();
  } catch {
    newLeadsCount = 0;
  }

  return (
    <AdminShell
      role={session.role}
      fullName={session.fullName || session.email}
      newLeadsCount={newLeadsCount}
    >
      {children}
    </AdminShell>
  );
}
