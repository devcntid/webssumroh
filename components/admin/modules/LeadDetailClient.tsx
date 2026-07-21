"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, MessageSquare, Phone, Save } from "lucide-react";
import { Badge } from "@/components/admin/ui/Badge";
import { Btn } from "@/components/admin/ui/Btn";
import { Field } from "@/components/admin/ui/Field";
import { useToast } from "@/components/admin/ui/Toast";
import { LEAD_ORDER, LEAD_ST } from "@/components/admin/lib/colors";
import { fetchJson } from "@/components/admin/lib/fetch-json";
import type { ContactLead, LeadStatus } from "@/types/db";

export function LeadDetailClient({ id }: { id: number }) {
  const { showToast } = useToast();
  const [lead, setLead] = useState<ContactLead | null>(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { ok, json } = await fetchJson<{ data?: ContactLead }>(`/api/leads/${id}`);
    if (!ok || !json.data) {
      showToast(json.error || "Lead not found", "error");
      setLoading(false);
      return;
    }
    setLead(json.data);
    setLoading(false);
  }, [id, showToast]);

  useEffect(() => {
    void load();
  }, [load]);

  async function setStatus(status: LeadStatus) {
    setSaving(true);
    const { ok, json } = await fetchJson(`/api/leads/${id}`, {
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
    const { ok, json } = await fetchJson(`/api/leads/${id}`, {
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
  if (!lead) return <div className="admin-empty">Lead not found.</div>;

  const wa = lead.phone.replace(/\D/g, "").replace(/^0/, "62");

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <Link href="/panel/leads" className="admin-btn ghost" style={{ marginBottom: 8 }}>
            <ArrowLeft size={13} /> Back to leads
          </Link>
          <h2>{lead.full_name}</h2>
          <p>
            <Badge color={LEAD_ST[lead.status] || "gray"}>{lead.status}</Badge>
            <span style={{ marginLeft: 8, fontSize: 12, color: "var(--text-muted)" }}>
              {lead.created_at?.slice(0, 16).replace("T", " ")}
            </span>
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <a href={`tel:${lead.phone}`} className="admin-btn secondary">
            <Phone size={13} /> Call
          </a>
          <a
            href={`https://wa.me/${wa}`}
            target="_blank"
            rel="noreferrer"
            className="admin-btn secondary"
          >
            <MessageSquare size={13} /> WhatsApp
          </a>
        </div>
      </div>

      <div className="admin-grid-2" style={{ marginBottom: 16 }}>
        <div className="admin-card">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              ["Phone", lead.phone],
              ["Email", lead.email || "—"],
              ["Subject", lead.subject || "—"],
              ["Source", lead.page_source || "—"],
            ].map(([k, v]) => (
              <div key={k}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 3 }}>
                  {k}
                </div>
                <div style={{ fontSize: 13 }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, background: "var(--surface-0)", borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 6 }}>
              Message
            </div>
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.65, whiteSpace: "pre-wrap" }}>{lead.message}</p>
          </div>
        </div>

        <div className="admin-card">
          <h3 style={{ margin: "0 0 12px", fontSize: 14 }}>Status workflow</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
            {LEAD_ORDER.map((s) => (
              <Btn
                key={s}
                variant={lead.status === s ? "primary" : "secondary"}
                disabled={saving || lead.status === s}
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
              placeholder="Internal note…"
            />
          </Field>
          <Btn variant="primary" icon={Save} onClick={saveNote} disabled={saving || !note.trim()}>
            Save note
          </Btn>

          {lead.agent_notes && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 6 }}>
                Notes history
              </div>
              <pre style={{
                margin: 0,
                fontSize: 12,
                whiteSpace: "pre-wrap",
                fontFamily: "inherit",
                background: "var(--surface-0)",
                padding: 12,
                borderRadius: 8,
              }}>
                {lead.agent_notes}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
