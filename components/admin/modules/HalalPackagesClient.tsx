"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Save } from "lucide-react";
import { Badge } from "@/components/admin/ui/Badge";
import { Toggle } from "@/components/admin/ui/Toggle";
import { Btn } from "@/components/admin/ui/Btn";
import { Modal } from "@/components/admin/ui/Modal";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import { Field } from "@/components/admin/ui/Field";
import { useToast } from "@/components/admin/ui/Toast";
import { fetchJson, issuesToFieldErrors } from "@/components/admin/lib/fetch-json";
import type { HalalDestination, HalalPackage } from "@/types/db";

type HalalPkgRow = HalalPackage & { country_name?: string };

type Form = {
  id?: number;
  destination_id: string;
  name: string;
  tag_line: string;
  seats_remaining: string;
  price_display_text: string;
  departure_month: string;
  highlights_text: string;
  is_featured: boolean;
  is_active: boolean;
};

const EMPTY: Form = {
  destination_id: "",
  name: "",
  tag_line: "",
  seats_remaining: "",
  price_display_text: "",
  departure_month: "",
  highlights_text: "",
  is_featured: false,
  is_active: true,
};

export function HalalPackagesClient() {
  const { showToast } = useToast();
  const [rows, setRows] = useState<HalalPkgRow[]>([]);
  const [destinations, setDestinations] = useState<HalalDestination[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"new" | "edit" | null>(null);
  const [form, setForm] = useState<Form>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadDest = useCallback(async () => {
    const { ok, json } = await fetchJson<{ data?: HalalDestination[] }>(
      `/api/halal-destinations?per_page=100&status=all`
    );
    if (ok) setDestinations(json.data ?? []);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), per_page: "25", status });
    const { ok, json } = await fetchJson<{ data?: HalalPkgRow[]; total?: number }>(
      `/api/halal-packages?${params}`
    );
    if (!ok) {
      showToast(json.error || "Failed to load", "error");
      setLoading(false);
      return;
    }
    setRows(json.data ?? []);
    setTotal(json.total ?? 0);
    setLoading(false);
  }, [page, status, showToast]);

  useEffect(() => {
    void loadDest();
  }, [loadDest]);

  useEffect(() => {
    void load();
  }, [load]);

  function openNew() {
    setForm({ ...EMPTY, destination_id: destinations[0] ? String(destinations[0].id) : "" });
    setErrors({});
    setModal("new");
  }

  function openEdit(r: HalalPkgRow) {
    setForm({
      id: r.id,
      destination_id: String(r.destination_id),
      name: r.name,
      tag_line: r.tag_line ?? "",
      seats_remaining: r.seats_remaining != null ? String(r.seats_remaining) : "",
      price_display_text: r.price_display_text ?? "",
      departure_month: r.departure_month ?? "",
      highlights_text: r.highlights_text ?? "",
      is_featured: r.is_featured,
      is_active: r.is_active,
    });
    setErrors({});
    setModal("edit");
  }

  function toBody(f: Form) {
    return {
      destination_id: Number(f.destination_id),
      name: f.name.trim(),
      tag_line: f.tag_line.trim() || null,
      seats_remaining: f.seats_remaining ? Number(f.seats_remaining) : null,
      price_display_text: f.price_display_text.trim() || null,
      departure_month: f.departure_month.trim() || null,
      highlights_text: f.highlights_text.trim() || null,
      is_featured: f.is_featured,
      is_active: f.is_active,
    };
  }

  async function save() {
    setSaving(true);
    setErrors({});
    const url = modal === "edit" && form.id ? `/api/halal-packages/${form.id}` : `/api/halal-packages`;
    const method = modal === "edit" ? "PUT" : "POST";
    const { ok, json } = await fetchJson(url, { method, body: JSON.stringify(toBody(form)) });
    setSaving(false);
    if (!ok) {
      if (json.issues) setErrors(issuesToFieldErrors(json.issues));
      showToast(json.error || "Save failed", "error");
      return;
    }
    showToast("Halal package saved");
    setModal(null);
    void load();
  }

  async function toggleField(r: HalalPkgRow, field: "is_featured" | "is_active", value: boolean) {
    const { ok, json } = await fetchJson(`/api/halal-packages/${r.id}`, {
      method: "PUT",
      body: JSON.stringify({
        destination_id: r.destination_id,
        name: r.name,
        tag_line: r.tag_line,
        seats_remaining: r.seats_remaining,
        meta_chips: r.meta_chips,
        highlights_text: r.highlights_text,
        price_display_text: r.price_display_text,
        price_idr: r.price_idr,
        cover_image_url: r.cover_image_url,
        departure_month: r.departure_month,
        departure_date: r.departure_date,
        display_order: r.display_order,
        is_featured: field === "is_featured" ? value : r.is_featured,
        is_active: field === "is_active" ? value : r.is_active,
      }),
    });
    if (!ok) {
      showToast(json.error || "Update failed", "error");
      return;
    }
    void load();
  }

  async function confirmDelete() {
    if (deleteId == null) return;
    setDeleting(true);
    const res = await fetch(`/api/halal-packages/${deleteId}`, { method: "DELETE" });
    setDeleting(false);
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      showToast((json as { error?: string }).error || "Delete failed", "error");
      setDeleteId(null);
      return;
    }
    showToast("Deleted");
    setDeleteId(null);
    void load();
  }

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h2>Halal packages</h2>
          <p>Tour packages linked to destinations.</p>
        </div>
        <Btn variant="primary" icon={Plus} onClick={openNew}>Add package</Btn>
      </div>

      <div className="admin-filter-tabs">
        {["all", "active", "inactive"].map((s) => (
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

      <div className="admin-card" style={{ padding: 0 }}>
        {loading ? (
          <div className="admin-empty">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="admin-empty">No packages found.</div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Package</th>
                  <th>Destination</th>
                  <th>Price</th>
                  <th>Month</th>
                  <th>Seats</th>
                  <th>Featured</th>
                  <th>Active</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{r.name}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{r.tag_line}</div>
                    </td>
                    <td><Badge color="green">{r.country_name || `#${r.destination_id}`}</Badge></td>
                    <td style={{ fontSize: 12 }}>{r.price_display_text || "—"}</td>
                    <td style={{ fontSize: 12 }}>{r.departure_month || "—"}</td>
                    <td style={{ fontSize: 12 }}>{r.seats_remaining ?? "—"}</td>
                    <td><Toggle checked={r.is_featured} onChange={(v) => void toggleField(r, "is_featured", v)} /></td>
                    <td><Toggle checked={r.is_active} onChange={(v) => void toggleField(r, "is_active", v)} /></td>
                    <td>
                      <div style={{ display: "flex", gap: 5 }}>
                        <Btn variant="ghost" onClick={() => openEdit(r)}><Edit2 size={12} /></Btn>
                        <Btn variant="ghost" danger onClick={() => setDeleteId(r.id)}><Trash2 size={12} /></Btn>
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

      {modal && (
        <Modal title={modal === "new" ? "Add halal package" : "Edit halal package"} onClose={() => setModal(null)} width={560}>
          <Field label="Destination" required error={errors.destination_id}>
            <select className="admin-select" value={form.destination_id} onChange={set("destination_id")}>
              <option value="">Select</option>
              {destinations.map((d) => (
                <option key={d.id} value={d.id}>{d.flag_emoji} {d.country_name}</option>
              ))}
            </select>
          </Field>
          <Field label="Name" required error={errors.name}>
            <input className="admin-input" value={form.name} onChange={set("name")} />
          </Field>
          <div className="admin-grid-2">
            <Field label="Tag line" error={errors.tag_line}>
              <input className="admin-input" value={form.tag_line} onChange={set("tag_line")} />
            </Field>
            <Field label="Price text" error={errors.price_display_text}>
              <input className="admin-input" value={form.price_display_text} onChange={set("price_display_text")} />
            </Field>
          </div>
          <div className="admin-grid-2">
            <Field label="Departure month" error={errors.departure_month}>
              <input className="admin-input" value={form.departure_month} onChange={set("departure_month")} placeholder="Feb 2026" />
            </Field>
            <Field label="Seats remaining" error={errors.seats_remaining}>
              <input className="admin-input" type="number" value={form.seats_remaining} onChange={set("seats_remaining")} />
            </Field>
          </div>
          <Field label="Highlights" error={errors.highlights_text}>
            <textarea className="admin-textarea" rows={3} value={form.highlights_text} onChange={set("highlights_text")} />
          </Field>
          <div style={{ display: "flex", gap: 20, marginBottom: 18 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, cursor: "pointer" }}>
              <Toggle checked={form.is_featured} onChange={(v) => setForm((p) => ({ ...p, is_featured: v }))} />
              Featured
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, cursor: "pointer" }}>
              <Toggle checked={form.is_active} onChange={(v) => setForm((p) => ({ ...p, is_active: v }))} />
              Active
            </label>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Btn onClick={() => setModal(null)}>Cancel</Btn>
            <Btn variant="primary" icon={Save} onClick={save} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Btn>
          </div>
        </Modal>
      )}

      {deleteId != null && (
        <ConfirmDialog
          title="Delete package"
          message="Soft-delete this halal package?"
          onConfirm={() => void confirmDelete()}
          onCancel={() => setDeleteId(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}
