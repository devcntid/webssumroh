"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Download, Eye, Search } from "lucide-react";
import { Badge } from "@/components/admin/ui/Badge";
import { Btn } from "@/components/admin/ui/Btn";
import { useToast } from "@/components/admin/ui/Toast";
import { LEAD_ORDER, LEAD_ST } from "@/components/admin/lib/colors";
import { fetchJson } from "@/components/admin/lib/fetch-json";
import type { ContactLead, LeadStatus } from "@/types/db";

function nextStatus(current: LeadStatus): LeadStatus | null {
  const i = LEAD_ORDER.indexOf(current);
  if (i < 0 || i >= LEAD_ORDER.length - 1) return null;
  return LEAD_ORDER[i + 1];
}

function advanceLabel(status: LeadStatus) {
  if (status === "new") return "Mark read";
  if (status === "read") return "Respond";
  if (status === "responded") return "Close";
  return null;
}

export function LeadsClient() {
  const { showToast } = useToast();
  const [rows, setRows] = useState<ContactLead[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      per_page: "25",
      status,
    });
    if (search.trim()) params.set("search", search.trim());
    const { ok, json } = await fetchJson<{ data?: ContactLead[]; total?: number }>(
      `/api/leads?${params}`
    );
    if (!ok) {
      showToast(json.error || "Failed to load leads", "error");
      setLoading(false);
      return;
    }
    setRows(json.data ?? []);
    setTotal(json.total ?? 0);
    setLoading(false);
  }, [page, status, search, showToast]);

  useEffect(() => {
    void load();
  }, [load]);

  async function advance(id: number, current: LeadStatus) {
    const next = nextStatus(current);
    if (!next) return;
    const { ok, json } = await fetchJson(`/api/leads/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: next }),
    });
    if (!ok) {
      showToast(json.error || "Update failed", "error");
      return;
    }
    showToast("Status updated");
    void load();
  }

  const exportHref = `/api/leads/export?format=xlsx${status !== "all" ? `&status=${status}` : ""}${search.trim() ? `&search=${encodeURIComponent(search.trim())}` : ""}`;

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h2>Leads inbox</h2>
          <p>General contact form submissions.</p>
        </div>
        <a href={exportHref} className="admin-btn secondary">
          <Download size={13} /> Export
        </a>
      </div>

      <div className="admin-filter-tabs">
        {["all", "new", "read", "responded", "closed"].map((s) => (
          <button
            key={s}
            type="button"
            className={`admin-filter-tab ${status === s ? "active" : ""}`}
            onClick={() => { setPage(1); setStatus(s); }}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="admin-toolbar">
        <div style={{ position: "relative", flex: 1, maxWidth: 320 }}>
          <Search size={13} style={{ position: "absolute", left: 10, top: 10, color: "var(--text-muted)" }} />
          <input
            className="admin-input"
            style={{ paddingLeft: 30 }}
            value={search}
            onChange={(e) => { setPage(1); setSearch(e.target.value); }}
            placeholder="Name, phone, or subject…"
          />
        </div>
      </div>

      <div className="admin-card" style={{ padding: 0 }}>
        {loading ? (
          <div className="admin-empty">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="admin-empty">No leads match your filter.</div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Lead</th>
                  <th>Subject</th>
                  <th>From page</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const label = advanceLabel(r.status);
                  return (
                    <tr key={r.id}>
                      <td style={{ fontSize: 11, color: "var(--text-muted)" }}>
                        {r.created_at?.slice(0, 10)}
                      </td>
                      <td>
                        <div style={{ fontWeight: 500, fontSize: 13 }}>{r.full_name}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{r.phone}</div>
                      </td>
                      <td style={{ fontSize: 12 }}>{r.subject || "—"}</td>
                      <td><Badge color="gray">{r.page_source || "—"}</Badge></td>
                      <td><Badge color={LEAD_ST[r.status] || "gray"}>{r.status}</Badge></td>
                      <td>
                        <div style={{ display: "flex", gap: 5 }}>
                          <Link href={`/panel/leads/${r.id}`} className="admin-btn ghost">
                            <Eye size={12} />
                          </Link>
                          {label && (
                            <Btn variant="secondary" onClick={() => void advance(r.id, r.status)}>
                              {label}
                            </Btn>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {total > 25 && (
          <div style={{ display: "flex", justifyContent: "space-between", padding: 12 }}>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{total} total</span>
            <div style={{ display: "flex", gap: 8 }}>
              <Btn disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</Btn>
              <Btn disabled={page * 25 >= total} onClick={() => setPage((p) => p + 1)}>Next</Btn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
