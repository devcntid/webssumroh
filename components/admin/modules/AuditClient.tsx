"use client";

import { useCallback, useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Badge } from "@/components/admin/ui/Badge";
import { Btn } from "@/components/admin/ui/Btn";
import { useToast } from "@/components/admin/ui/Toast";
import { ACT_COL } from "@/components/admin/lib/colors";
import { fetchJson } from "@/components/admin/lib/fetch-json";
import type { AuditAction } from "@/types/db";

interface AuditRow {
  id: number;
  admin_user_id: number | null;
  action: AuditAction;
  entity_type: string;
  entity_id: number | null;
  changed_fields: Record<string, unknown> | null;
  created_at: string;
  user_name: string | null;
}

function detailPreview(fields: Record<string, unknown> | null): string {
  if (!fields) return "—";
  try {
    const s = JSON.stringify(fields);
    return s.length > 80 ? `${s.slice(0, 80)}…` : s;
  } catch {
    return "—";
  }
}

export function AuditClient() {
  const { showToast } = useToast();
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), per_page: "25" });
    const { ok, json } = await fetchJson<{ data?: AuditRow[]; total?: number }>(
      `/api/audit?${params}`
    );
    if (!ok) {
      showToast(json.error || "Failed to load audit log", "error");
      setLoading(false);
      return;
    }
    setRows(json.data ?? []);
    setTotal(json.total ?? 0);
    setLoading(false);
  }, [page, showToast]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h2>Audit log</h2>
          <p>Read-only history of admin actions.</p>
        </div>
        <a href="/api/audit/export?format=xlsx" className="admin-btn secondary">
          <Download size={13} /> Export
        </a>
      </div>

      <div className="admin-card" style={{ padding: 0 }}>
        {loading ? (
          <div className="admin-empty">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="admin-empty">No audit entries.</div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>When</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>Detail</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td style={{ fontSize: 11, color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                      {r.created_at?.slice(0, 16).replace("T", " ")}
                    </td>
                    <td style={{ fontSize: 12 }}>{r.user_name || "—"}</td>
                    <td><Badge color={ACT_COL[r.action] || "gray"}>{r.action}</Badge></td>
                    <td style={{ fontSize: 12 }}>
                      {r.entity_type}
                      {r.entity_id != null ? ` #${r.entity_id}` : ""}
                    </td>
                    <td style={{ fontSize: 11, color: "var(--text-secondary)", maxWidth: 280 }}>
                      {detailPreview(r.changed_fields)}
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
