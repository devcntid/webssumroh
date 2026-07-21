import Link from "next/link";
import { Mail, Package, Calendar, AlertTriangle, Star, Plus } from "lucide-react";
import { getDashboardStats } from "@/lib/queries/dashboard";
import { DashboardCharts } from "@/components/admin/charts/DashboardCharts";
import { Badge } from "@/components/admin/ui/Badge";
import { getServerSession } from "@/lib/auth";
import { redirect } from "next/navigation";

/**
 * Admin Dashboard — Server Component
 * Data: lib/queries/dashboard.ts
 */
export default async function DashboardPage() {
  const session = await getServerSession();
  if (!session) redirect("/panel/login");

  let stats;
  try {
    stats = await getDashboardStats();
  } catch {
    stats = {
      newLeadsToday: 0,
      activePackages: 0,
      inactivePackages: 0,
      departuresThisMonth: [],
      seatsAlerts: [],
      pendingTestimonials: [],
      leadsByDay: [],
      packagesByCategory: [],
    };
  }

  const canEdit = ["super_admin", "admin", "editor"].includes(session.role);
  const canLeads = ["super_admin", "admin", "cs_agent"].includes(session.role);

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h2>Dashboard</h2>
          <p>Welcome back. Here&apos;s what&apos;s happening today.</p>
        </div>
      </div>

      <div className="admin-stat-grid">
        <StatCard
          icon={<Mail size={17} color="#C4235C" />}
          ibg="#FDDDE6"
          value={String(stats.newLeadsToday)}
          label="New leads today"
        />
        <StatCard
          icon={<Package size={17} color="#7C3ABE" />}
          ibg="#EFE2FB"
          value={String(stats.activePackages)}
          label="Active packages"
          sub={`${stats.inactivePackages} inactive`}
        />
        <StatCard
          icon={<Calendar size={17} color="#D4A017" />}
          ibg="#FEF6DC"
          value={String(stats.departuresThisMonth.length)}
          label="Departures this month"
        />
        <StatCard
          icon={<AlertTriangle size={17} color="#DC2626" />}
          ibg="#FEE2E2"
          value={String(stats.seatsAlerts.length)}
          label="Seats alerts (≤5)"
        />
      </div>

      {canEdit && (
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          <Link href="/panel/packages" className="admin-btn primary"><Plus size={13} /> Add Package</Link>
          <Link href="/panel/testimonials" className="admin-btn secondary"><Plus size={13} /> Add Testimonial</Link>
          <Link href="/panel/faqs" className="admin-btn secondary"><Plus size={13} /> Add FAQ</Link>
          {canLeads && <Link href="/panel/leads" className="admin-btn secondary">View Leads</Link>}
        </div>
      )}

      {stats.seatsAlerts.length > 0 && (
        <div className="admin-card" style={{ marginBottom: 16, borderColor: "#FCA5A5" }}>
          <h3 style={{ margin: "0 0 10px", fontSize: 14, color: "#DC2626", display: "flex", alignItems: "center", gap: 6 }}>
            <AlertTriangle size={14} /> Low seats
          </h3>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Package</th>
                  <th>Date</th>
                  <th>City</th>
                  <th>Seats</th>
                </tr>
              </thead>
              <tbody>
                {stats.seatsAlerts.map((s) => (
                  <tr key={s.id}>
                    <td>{s.package_name}</td>
                    <td>{formatDate(s.departure_date)}</td>
                    <td>{s.departure_city}</td>
                    <td><Badge color="red">{s.seats_remaining} left</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="admin-grid-2">
        <div className="admin-card">
          <h3 style={{ margin: "0 0 10px", fontSize: 14 }}>Departures this month</h3>
          {stats.departuresThisMonth.length === 0 ? (
            <div className="admin-empty">No departures scheduled this month.</div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Package</th>
                    <th>Date</th>
                    <th>Seats</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.departuresThisMonth.slice(0, 8).map((s) => (
                    <tr key={s.id}>
                      <td>{s.package_name}</td>
                      <td>{formatDate(s.departure_date)}</td>
                      <td>{s.seats_remaining}/{s.total_seats}</td>
                      <td><Badge color="purple">{s.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="admin-card">
          <h3 style={{ margin: "0 0 10px", fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>
            <Star size={14} /> Pending testimonials
          </h3>
          {stats.pendingTestimonials.length === 0 ? (
            <div className="admin-empty">No pending testimonials.</div>
          ) : (
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              {stats.pendingTestimonials.slice(0, 3).map((t) => (
                <li key={t.id} style={{ fontSize: 13 }}>
                  <strong>{t.full_name}</strong>
                  <div style={{ color: "var(--text-secondary)", marginTop: 2 }}>
                    {t.quote_text.slice(0, 100)}{t.quote_text.length > 100 ? "…" : ""}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <DashboardCharts
        leadsByDay={stats.leadsByDay}
        packagesByCategory={stats.packagesByCategory}
      />
    </div>
  );
}

function formatDate(value: string | Date | null | undefined): string {
  if (value == null || value === "") return "—";
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? "—" : value.toISOString().slice(0, 10);
  }
  return String(value).slice(0, 10);
}

function StatCard({
  icon, ibg, value, label, sub,
}: {
  icon: React.ReactNode;
  ibg: string;
  value: string;
  label: string;
  sub?: string;
}) {
  return (
    <div className="admin-card">
      <div style={{
        width: 38, height: 38, borderRadius: 10, background: ibg,
        display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12,
      }}>
        {icon}
      </div>
      <div style={{ fontSize: 26, fontWeight: 500, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}
