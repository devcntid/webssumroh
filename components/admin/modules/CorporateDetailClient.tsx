"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { Badge } from "@/components/admin/ui/Badge";
import { Btn } from "@/components/admin/ui/Btn";
import { Field } from "@/components/admin/ui/Field";
import { useToast } from "@/components/admin/ui/Toast";
import { CORP_ORDER, LEAD_ST } from "@/components/admin/lib/colors";
import { fetchJson } from "@/components/admin/lib/fetch-json";
import type { CorpStatus, CorporateInquiry } from "@/types/db";

export function CorporateDetailClient({ id }: { id: number }) {
  const { showToast } = useToast();
  const [item, setItem] = useState<CorporateInquiry | null>(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { ok, json } = await fetchJson<{ data?: CorporateInquiry }>(`/api/corporate/${id}`);
    if (!ok || !json.data) {
      showToast(json.error || "Not found", "error");
      setLoading(false);
      return;
    }
    setItem(json.data);
    setLoading(false);
  }, [id, showToast]);

  useEffect(() => {
    void load();
  }, [load]);

  async function setStatus(status: CorpStatus) {
    setSaving(true);
    const { ok, json } = await fetchJson(`/api/corporate/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    setSaving(false);
    if (!ok) {
      showToast(json.error || "Update failed", "error");
      return;
    }
    showToast(`Status → ${status}`);
    void load();
  }

  async function saveNote() {
    if (!note.trim()) return;
    setSaving(true);
    const { ok, json } = await fetchJson(`/api/corporate/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ agent_notes: note.trim() }),
    });
    setSaving(false);
    if (!ok) {
      showToast(json.error || "Failed to save note", "error");
      return;
    }
    showToast("Note added");
    setNote("");
    void load();
  }

  if (loading) return <div className="admin-empty">Loading…</div>;
  if (!item) return <div className="admin-empty">Inquiry not found.</div>;

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <Link href="/panel/corporate" className="admin-btn ghost" style={{ marginBottom: 8 }}>
            <ArrowLeft size={13} /> Back
          </Link>
          <h2>{item.company_name}</h2>
          <p>
            <Badge color={LEAD_ST[item.status] || "gray"}>{item.status}</Badge>
          </p>
        </div>
      </div>

      <div className="admin-grid-2">
        <div className="admin-card">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              ["Contact", item.contact_person],
              ["Phone", item.phone],
              ["Email", item.email || "—"],
              ["Estimated pax", item.estimated_pax ?? "—"],
              ["Travel type", item.travel_type],
              ["Preferred date", item.preferred_date?.slice(0, 10) || "—"],
            ].map(([k, v]) => (
              <div key={String(k)}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 3 }}>
                  {k}
                </div>
                <div style={{ fontSize: 13 }}>{v}</div>
              </div>
            ))}
          </div>
          {item.notes && (
            <div style={{ marginTop: 16, background: "var(--surface-0)", borderRadius: 10, padding: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 6 }}>
                Client notes
              </div>
              <p style={{ margin: 0, fontSize: 13, whiteSpace: "pre-wrap" }}>{item.notes}</p>
            </div>
          )}
        </div>

        <div className="admin-card">
          <h3 style={{ margin: "0 0 12px", fontSize: 14 }}>Status</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
            {CORP_ORDER.map((s) => (
              <Btn
                key={s}
                variant={item.status === s ? "primary" : "secondary"}
                disabled={saving || item.status === s}
                onClick={() => void setStatus(s)}
              >
                {s}
              </Btn>
            ))}
          </div>
          <Field label="Add agent note">
            <textarea
              className="admin-textarea"
              rows={4}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </Field>
          <Btn variant="primary" icon={Save} onClick={saveNote} disabled={saving || !note.trim()}>
            Save note
          </Btn>
          {item.agent_notes && (
            <pre style={{
              marginTop: 16,
              fontSize: 12,
              whiteSpace: "pre-wrap",
              fontFamily: "inherit",
              background: "var(--surface-0)",
              padding: 12,
              borderRadius: 8,
            }}>
              {item.agent_notes}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
