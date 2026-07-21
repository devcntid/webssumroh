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
import { CTX_COL } from "@/components/admin/lib/colors";
import { fetchJson, issuesToFieldErrors } from "@/components/admin/lib/fetch-json";
import type { PageContext, Testimonial } from "@/types/db";

type Form = {
  id?: number;
  full_name: string;
  initials: string;
  city_or_role: string;
  package_name: string;
  star_rating: string;
  quote_text: string;
  page_context: PageContext;
  is_verified: boolean;
  is_active: boolean;
};

const EMPTY: Form = {
  full_name: "",
  initials: "",
  city_or_role: "",
  package_name: "",
  star_rating: "5",
  quote_text: "",
  page_context: "general",
  is_verified: false,
  is_active: true,
};

function initialsFromName(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function TestimonialsClient() {
  const { showToast } = useToast();
  const [rows, setRows] = useState<Testimonial[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageContext, setPageContext] = useState("all");
  const [verified, setVerified] = useState("all");
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"new" | "edit" | null>(null);
  const [form, setForm] = useState<Form>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      per_page: "25",
      page_context: pageContext,
      verified,
      active: "all",
    });
    const { ok, json } = await fetchJson<{ data?: Testimonial[]; total?: number }>(
      `/api/testimonials?${params}`
    );
    if (!ok) {
      showToast(json.error || "Failed to load", "error");
      setLoading(false);
      return;
    }
    setRows(json.data ?? []);
    setTotal(json.total ?? 0);
    setLoading(false);
  }, [page, pageContext, verified, showToast]);

  useEffect(() => {
    void load();
  }, [load]);

  function openNew() {
    setForm(EMPTY);
    setErrors({});
    setModal("new");
  }

  function openEdit(r: Testimonial) {
    setForm({
      id: r.id,
      full_name: r.full_name,
      initials: r.initials,
      city_or_role: r.city_or_role ?? "",
      package_name: r.package_name ?? "",
      star_rating: String(r.star_rating),
      quote_text: r.quote_text,
      page_context: r.page_context,
      is_verified: r.is_verified,
      is_active: r.is_active,
    });
    setErrors({});
    setModal("edit");
  }

  function toBody(f: Form) {
    return {
      full_name: f.full_name.trim(),
      initials: (f.initials.trim() || initialsFromName(f.full_name)).slice(0, 10),
      city_or_role: f.city_or_role.trim() || null,
      package_name: f.package_name.trim() || null,
      star_rating: Number(f.star_rating) || 5,
      quote_text: f.quote_text.trim(),
      page_context: f.page_context,
      is_verified: f.is_verified,
      is_active: f.is_active,
    };
  }

  async function save() {
    setSaving(true);
    setErrors({});
    const url = modal === "edit" && form.id ? `/api/testimonials/${form.id}` : `/api/testimonials`;
    const method = modal === "edit" ? "PUT" : "POST";
    const { ok, json } = await fetchJson(url, { method, body: JSON.stringify(toBody(form)) });
    setSaving(false);
    if (!ok) {
      if (json.issues) setErrors(issuesToFieldErrors(json.issues));
      showToast(json.error || "Save failed", "error");
      return;
    }
    showToast("Testimonial saved");
    setModal(null);
    void load();
  }

  async function toggleField(r: Testimonial, field: "is_verified" | "is_active", value: boolean) {
    const { ok, json } = await fetchJson(`/api/testimonials/${r.id}`, {
      method: "PUT",
      body: JSON.stringify({
        full_name: r.full_name,
        initials: r.initials,
        city_or_role: r.city_or_role,
        package_name: r.package_name,
        star_rating: r.star_rating,
        quote_text: r.quote_text,
        page_context: r.page_context,
        date_collected: r.date_collected,
        display_order: r.display_order,
        is_verified: field === "is_verified" ? value : r.is_verified,
        is_active: field === "is_active" ? value : r.is_active,
      }),
    });
    if (!ok) {
      showToast(json.error || "Update failed", "error");
      return;
    }
    showToast(field === "is_verified" ? "Verification updated" : "Active updated");
    void load();
  }

  async function confirmDelete() {
    if (deleteId == null) return;
    setDeleting(true);
    const res = await fetch(`/api/testimonials/${deleteId}`, { method: "DELETE" });
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
          <h2>Testimonials</h2>
          <p>Verify quotes before they appear on the public site.</p>
        </div>
        <Btn variant="primary" icon={Plus} onClick={openNew}>Add testimonial</Btn>
      </div>

      <div className="admin-filter-tabs">
        {["all", "general", "halal-tour", "korporat"].map((c) => (
          <button
            key={c}
            type="button"
            className={`admin-filter-tab ${pageContext === c ? "active" : ""}`}
            onClick={() => { setPage(1); setPageContext(c); }}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="admin-filter-tabs" style={{ marginTop: 8 }}>
        {[
          ["all", "All"],
          ["yes", "Verified"],
          ["no", "Unverified"],
        ].map(([v, label]) => (
          <button
            key={v}
            type="button"
            className={`admin-filter-tab ${verified === v ? "active" : ""}`}
            onClick={() => { setPage(1); setVerified(v); }}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="admin-card" style={{ padding: 0 }}>
        {loading ? (
          <div className="admin-empty">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="admin-empty">No testimonials found.</div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Person</th>
                  <th>Context</th>
                  <th>Quote</th>
                  <th>★</th>
                  <th>Verified</th>
                  <th>Active</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{r.full_name}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{r.city_or_role}</div>
                    </td>
                    <td><Badge color={CTX_COL[r.page_context] || "gray"}>{r.page_context}</Badge></td>
                    <td style={{ fontSize: 12, maxWidth: 280 }}>
                      {r.quote_text.slice(0, 80)}{r.quote_text.length > 80 ? "…" : ""}
                    </td>
                    <td style={{ fontSize: 12 }}>{r.star_rating}</td>
                    <td><Toggle checked={r.is_verified} onChange={(v) => void toggleField(r, "is_verified", v)} /></td>
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
        <Modal title={modal === "new" ? "Add testimonial" : "Edit testimonial"} onClose={() => setModal(null)} width={560}>
          <div className="admin-grid-2">
            <Field label="Full name" required error={errors.full_name}>
              <input
                className="admin-input"
                value={form.full_name}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    full_name: e.target.value,
                    initials: p.initials || initialsFromName(e.target.value),
                  }))
                }
              />
            </Field>
            <Field label="Initials" required error={errors.initials}>
              <input className="admin-input" value={form.initials} onChange={set("initials")} maxLength={10} />
            </Field>
          </div>
          <div className="admin-grid-2">
            <Field label="City / role" error={errors.city_or_role}>
              <input className="admin-input" value={form.city_or_role} onChange={set("city_or_role")} />
            </Field>
            <Field label="Package name" error={errors.package_name}>
              <input className="admin-input" value={form.package_name} onChange={set("package_name")} />
            </Field>
          </div>
          <div className="admin-grid-2">
            <Field label="Context" error={errors.page_context}>
              <select className="admin-select" value={form.page_context} onChange={set("page_context")}>
                {["general", "halal-tour", "korporat"].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Star rating" error={errors.star_rating}>
              <select className="admin-select" value={form.star_rating} onChange={set("star_rating")}>
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Quote" required error={errors.quote_text}>
            <textarea className="admin-textarea" rows={4} value={form.quote_text} onChange={set("quote_text")} />
          </Field>
          <div style={{ display: "flex", gap: 20, marginBottom: 18 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, cursor: "pointer" }}>
              <Toggle checked={form.is_verified} onChange={(v) => setForm((p) => ({ ...p, is_verified: v }))} />
              Verified
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
          title="Delete testimonial"
          message="Soft-delete this testimonial?"
          onConfirm={() => void confirmDelete()}
          onCancel={() => setDeleteId(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}
