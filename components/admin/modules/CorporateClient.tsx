"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Download, Eye, Search } from "lucide-react";
import { Badge } from "@/components/admin/ui/Badge";
import { Btn } from "@/components/admin/ui/Btn";
import { useToast } from "@/components/admin/ui/Toast";
import { CORP_ORDER, LEAD_ST } from "@/components/admin/lib/colors";
import { fetchJson } from "@/components/admin/lib/fetch-json";
import type { CorpStatus, CorporateInquiry } from "@/types/db";

function nextStatus(current: CorpStatus): CorpStatus | null {
  const i = CORP_ORDER.indexOf(current);
  if (i < 0 || i >= CORP_ORDER.length - 1) return null;
  return CORP_ORDER[i + 1];
}

export function CorporateClient() {
  const { showToast } = useToast();
  const [rows, setRows] = useState<CorporateInquiry[]>([]);
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
    const { ok, json } = await fetchJson<{ data?: CorporateInquiry[]; total?: number }>(
      `/api/corporate?${params}`
    );
    if (!ok) {
      showToast(json.error || "Failed to load", "error");
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

  async function advance(id: number, current: CorpStatus) {
    const next = nextStatus(current);
    if (!next) return;
    const { ok, json } = await fetchJson(`/api/corporate/${id}`, {
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

  const exportHref = `/api/corporate/export?format=xlsx${status !== "all" ? `&status=${status}` : ""}`;

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h2>Corporate inquiries</h2>
          <p>Group / company travel requests.</p>
        </div>
        <a href={exportHref} className="admin-btn secondary">
          <Download size={13} /> Export
        </a>
      </div>

      <div className="admin-filter-tabs">
        {["all", "new", "read", "responded", "quoted", "closed"].map((s) => (
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
            placeholder="Company or contact…"
          />
        </div>
      </div>

      <div className="admin-card" style={{ padding: 0 }}>
        {loading ? (
          <div className="admin-empty">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="admin-empty">No inquiries found.</div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Company</th>
                  <th>Contact</th>
                  <th>Pax</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td style={{ fontSize: 11, color: "var(--text-muted)" }}>
                      {r.created_at?.slice(0, 10)}
                    </td>
                    <td style={{ fontWeight: 500, fontSize: 13 }}>{r.company_name}</td>
                    <td>
                      <div style={{ fontSize: 12 }}>{r.contact_person}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{r.phone}</div>
                    </td>
                    <td style={{ fontSize: 12 }}>{r.estimated_pax ?? "—"}</td>
                    <td><Badge color="blue">{r.travel_type}</Badge></td>
                    <td><Badge color={LEAD_ST[r.status] || "gray"}>{r.status}</Badge></td>
                    <td>
                      <div style={{ display: "flex", gap: 5 }}>
                        <Link href={`/panel/corporate/${r.id}`} className="admin-btn ghost">
                          <Eye size={12} />
                        </Link>
                        {r.status !== "closed" && (
                          <Btn variant="secondary" onClick={() => void advance(r.id, r.status)}>
                            Advance
                          </Btn>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
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
