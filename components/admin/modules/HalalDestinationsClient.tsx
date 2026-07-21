"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Save, Search } from "lucide-react";
import { Badge } from "@/components/admin/ui/Badge";
import { Toggle } from "@/components/admin/ui/Toggle";
import { Btn } from "@/components/admin/ui/Btn";
import { Modal } from "@/components/admin/ui/Modal";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import { Field } from "@/components/admin/ui/Field";
import { useToast } from "@/components/admin/ui/Toast";
import { fetchJson, issuesToFieldErrors } from "@/components/admin/lib/fetch-json";
import type { HalalDestination } from "@/types/db";

type Form = {
  id?: number;
  country_name: string;
  flag_emoji: string;
  badge_label: string;
  duration_text: string;
  best_season: string;
  starting_price_text: string;
  description: string;
  is_active: boolean;
};

const EMPTY: Form = {
  country_name: "",
  flag_emoji: "",
  badge_label: "",
  duration_text: "",
  best_season: "",
  starting_price_text: "",
  description: "",
  is_active: true,
};

export function HalalDestinationsClient() {
  const { showToast } = useToast();
  const [rows, setRows] = useState<HalalDestination[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"new" | "edit" | null>(null);
  const [form, setForm] = useState<Form>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), per_page: "25", status });
    if (search.trim()) params.set("search", search.trim());
    const { ok, json } = await fetchJson<{ data?: HalalDestination[]; total?: number }>(
      `/api/halal-destinations?${params}`
    );
    if (!ok) {
      showToast(json.error || "Failed to load", "error");
      setLoading(false);
      return;
    }
    setRows(json.data ?? []);
    setTotal(json.total ?? 0);
    setLoading(false);
  }, [page, search, status, showToast]);

  useEffect(() => {
    void load();
  }, [load]);

  function openNew() {
    setForm(EMPTY);
    setErrors({});
    setModal("new");
  }

  function openEdit(r: HalalDestination) {
    setForm({
      id: r.id,
      country_name: r.country_name,
      flag_emoji: r.flag_emoji ?? "",
      badge_label: r.badge_label ?? "",
      duration_text: r.duration_text ?? "",
      best_season: r.best_season ?? "",
      starting_price_text: r.starting_price_text ?? "",
      description: r.description ?? "",
      is_active: r.is_active,
    });
    setErrors({});
    setModal("edit");
  }

  function toBody(f: Form) {
    return {
      country_name: f.country_name.trim(),
      flag_emoji: f.flag_emoji.trim() || null,
      badge_label: f.badge_label.trim() || null,
      duration_text: f.duration_text.trim() || null,
      best_season: f.best_season.trim() || null,
      starting_price_text: f.starting_price_text.trim() || null,
      description: f.description.trim() || null,
      is_active: f.is_active,
    };
  }

  async function save() {
    setSaving(true);
    setErrors({});
    const url = modal === "edit" && form.id ? `/api/halal-destinations/${form.id}` : `/api/halal-destinations`;
    const method = modal === "edit" ? "PUT" : "POST";
    const { ok, json } = await fetchJson(url, { method, body: JSON.stringify(toBody(form)) });
    setSaving(false);
    if (!ok) {
      if (json.issues) setErrors(issuesToFieldErrors(json.issues));
      showToast(json.error || "Save failed", "error");
      return;
    }
    showToast("Destination saved");
    setModal(null);
    void load();
  }

  async function toggleActive(r: HalalDestination, value: boolean) {
    const { ok, json } = await fetchJson(`/api/halal-destinations/${r.id}`, {
      method: "PUT",
      body: JSON.stringify({
        country_name: r.country_name,
        flag_emoji: r.flag_emoji,
        badge_label: r.badge_label,
        duration_text: r.duration_text,
        best_season: r.best_season,
        starting_price_text: r.starting_price_text,
        description: r.description,
        cover_image_url: r.cover_image_url,
        is_active: value,
        display_order: r.display_order,
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
    const res = await fetch(`/api/halal-destinations/${deleteId}`, { method: "DELETE" });
    setDeleting(false);
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      showToast((json as { error?: string }).error || "Delete failed", "error");
      setDeleteId(null);
      return;
    }
    showToast("Destination deleted");
    setDeleteId(null);
    void load();
  }

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h2>Halal destinations</h2>
          <p>Countries featured on the Halal Tour page.</p>
        </div>
        <Btn variant="primary" icon={Plus} onClick={openNew}>Add destination</Btn>
      </div>

      <div className="admin-toolbar">
        <div style={{ position: "relative", flex: 1, maxWidth: 280 }}>
          <Search size={13} style={{ position: "absolute", left: 10, top: 10, color: "var(--text-muted)" }} />
          <input
            className="admin-input"
            style={{ paddingLeft: 30 }}
            value={search}
            onChange={(e) => { setPage(1); setSearch(e.target.value); }}
            placeholder="Search country…"
          />
        </div>
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
          <div className="admin-empty">No destinations found.</div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Country</th>
                  <th>Badge</th>
                  <th>Duration</th>
                  <th>From</th>
                  <th>Active</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <span style={{ marginRight: 6 }}>{r.flag_emoji}</span>
                      <strong style={{ fontSize: 13 }}>{r.country_name}</strong>
                    </td>
                    <td>{r.badge_label ? <Badge color="gold">{r.badge_label}</Badge> : "—"}</td>
                    <td style={{ fontSize: 12 }}>{r.duration_text || "—"}</td>
                    <td style={{ fontSize: 12 }}>{r.starting_price_text || "—"}</td>
                    <td><Toggle checked={r.is_active} onChange={(v) => void toggleActive(r, v)} /></td>
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
        <Modal title={modal === "new" ? "Add destination" : "Edit destination"} onClose={() => setModal(null)}>
          <div className="admin-grid-2">
            <Field label="Country name" required error={errors.country_name}>
              <input className="admin-input" value={form.country_name} onChange={set("country_name")} />
            </Field>
            <Field label="Flag emoji" error={errors.flag_emoji}>
              <input className="admin-input" value={form.flag_emoji} onChange={set("flag_emoji")} placeholder="🇹🇷" />
            </Field>
          </div>
          <div className="admin-grid-2">
            <Field label="Badge label" error={errors.badge_label}>
              <input className="admin-input" value={form.badge_label} onChange={set("badge_label")} />
            </Field>
            <Field label="Duration" error={errors.duration_text}>
              <input className="admin-input" value={form.duration_text} onChange={set("duration_text")} placeholder="10D7N" />
            </Field>
          </div>
          <div className="admin-grid-2">
            <Field label="Best season" error={errors.best_season}>
              <input className="admin-input" value={form.best_season} onChange={set("best_season")} />
            </Field>
            <Field label="Starting price" error={errors.starting_price_text}>
              <input className="admin-input" value={form.starting_price_text} onChange={set("starting_price_text")} />
            </Field>
          </div>
          <Field label="Description" error={errors.description}>
            <textarea className="admin-textarea" rows={3} value={form.description} onChange={set("description")} />
          </Field>
          <label style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, marginBottom: 18, cursor: "pointer" }}>
            <Toggle checked={form.is_active} onChange={(v) => setForm((p) => ({ ...p, is_active: v }))} />
            Active
          </label>
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
          title="Delete destination"
          message="Soft-delete this destination?"
          onConfirm={() => void confirmDelete()}
          onCancel={() => setDeleteId(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}
