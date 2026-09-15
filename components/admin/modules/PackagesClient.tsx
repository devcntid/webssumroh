"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Save, Search, GripVertical, Upload, RotateCcw } from "lucide-react";
import { Badge } from "@/components/admin/ui/Badge";
import { Toggle } from "@/components/admin/ui/Toggle";
import { Btn } from "@/components/admin/ui/Btn";
import { Modal } from "@/components/admin/ui/Modal";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import { Field } from "@/components/admin/ui/Field";
import { useToast } from "@/components/admin/ui/Toast";
import { SortableList } from "@/components/admin/dnd/SortableList";
import { CAT_COL } from "@/components/admin/lib/colors";
import { uploadAdminFile } from "@/components/admin/lib/compress-image";
import { fetchJson, issuesToFieldErrors } from "@/components/admin/lib/fetch-json";
import type { Package, PackageCategory, PriceMode } from "@/types/db";

type Form = {
  id?: number;
  slug: string;
  name: string;
  category: PackageCategory;
  tag_line: string;
  description: string;
  detail_text: string;
  hotel_distance_m: string;
  flight_type: string;
  price_mode: PriceMode;
  price_display_text: string;
  cover_image_url: string;
  is_featured: boolean;
  is_active: boolean;
};

const EMPTY: Form = {
  slug: "",
  name: "",
  category: "hemat",
  tag_line: "",
  description: "",
  detail_text: "",
  hotel_distance_m: "350",
  flight_type: "Direct ✈",
  price_mode: "contact",
  price_display_text: "Hubungi CS",
  cover_image_url: "",
  is_featured: false,
  is_active: true,
};

export function PackagesClient() {
  const { showToast } = useToast();
  const [rows, setRows] = useState<Package[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all");
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"new" | "edit" | null>(null);
  const [form, setForm] = useState<Form>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [reorderMode, setReorderMode] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      per_page: "25",
      status,
    });
    if (search.trim()) params.set("search", search.trim());
    if (category !== "all") params.set("category", category);
    const { ok, json } = await fetchJson<{ data?: Package[]; total?: number }>(
      `/api/packages?${params}`
    );
    if (!ok) {
      showToast(json.error || "Failed to load packages", "error");
      setLoading(false);
      return;
    }
    setRows(json.data ?? []);
    setTotal(json.total ?? 0);
    setLoading(false);
  }, [page, search, status, category, showToast]);

  useEffect(() => {
    void load();
  }, [load]);

  async function toggle(id: number, field: "is_featured" | "is_active", value: boolean) {
    const { ok, json } = await fetchJson(`/api/packages/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ field, value }),
    });
    if (!ok) {
      showToast(json.error || "Update failed", "error");
      return;
    }
    showToast(field === "is_featured" ? "Featured updated" : "Active updated");
    void load();
  }

  function openNew() {
    setForm(EMPTY);
    setErrors({});
    setModal("new");
  }

  function openEdit(r: Package) {
    setForm({
      id: r.id,
      slug: r.slug,
      name: r.name,
      category: r.category,
      tag_line: r.tag_line ?? "",
      description: r.description ?? "",
      detail_text: r.detail_text ?? "",
      hotel_distance_m: r.hotel_distance_m != null ? String(r.hotel_distance_m) : "",
      flight_type: r.flight_type ?? "",
      price_mode: r.price_mode,
      price_display_text: r.price_display_text ?? "",
      cover_image_url: r.cover_image_url ?? "",
      is_featured: r.is_featured,
      is_active: r.is_active,
    });
    setErrors({});
    setModal("edit");
  }

  async function uploadCover(file?: File) {
    if (!file) return;
    setUploading(true);
    try {
      const data = await uploadAdminFile(file, "packages");
      setForm((current) => ({ ...current, cover_image_url: data.url }));
      showToast("Image uploaded. Save package to publish it.");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Failed to upload package image", "error");
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    setSaving(true);
    setErrors({});
    const body = {
      slug: form.slug.trim() || undefined,
      name: form.name.trim(),
      category: form.category,
      tag_line: form.tag_line.trim() || null,
      description: form.description.trim() || null,
      detail_text: form.detail_text.trim() || null,
      hotel_distance_m: form.hotel_distance_m ? Number(form.hotel_distance_m) : null,
      flight_type: form.flight_type.trim() || null,
      price_mode: form.price_mode,
      price_display_text: form.price_display_text.trim() || null,
      cover_image_url: form.cover_image_url.trim() || null,
      is_featured: form.is_featured,
      is_active: form.is_active,
    };
    const url = modal === "edit" && form.id ? `/api/packages/${form.id}` : `/api/packages`;
    const method = modal === "edit" ? "PUT" : "POST";
    const payload =
      modal === "edit"
        ? { ...body, slug: form.slug.trim() || form.name.toLowerCase().replace(/\s+/g, "-") }
        : body;
    const { ok, json } = await fetchJson(url, { method, body: JSON.stringify(payload) });
    setSaving(false);
    if (!ok) {
      if (json.issues) setErrors(issuesToFieldErrors(json.issues));
      showToast(json.error || "Save failed", "error");
      return;
    }
    showToast(modal === "new" ? "Package created" : "Package updated");
    setModal(null);
    void load();
  }

  async function confirmDelete() {
    if (deleteId == null) return;
    setDeleting(true);
    const res = await fetch(`/api/packages/${deleteId}`, { method: "DELETE" });
    setDeleting(false);
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      showToast((json as { error?: string }).error || "Delete failed", "error");
      setDeleteId(null);
      return;
    }
    showToast("Package deleted");
    setDeleteId(null);
    void load();
  }

  async function handleReorder(orderedIds: number[]) {
    const { ok, json } = await fetchJson("/api/packages/reorder", {
      method: "PATCH",
      body: JSON.stringify({ ordered_ids: orderedIds }),
    });
    if (!ok) {
      showToast(json.error || "Reorder failed", "error");
      throw new Error("reorder failed");
    }
    showToast("Order saved");
    void load();
  }

  const set = (k: keyof Form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h2>Packages (Umroh)</h2>
          <p>Manage umroh packages. Use Featured for homepage highlight.</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn
            variant={reorderMode ? "primary" : "secondary"}
            icon={GripVertical}
            onClick={() => setReorderMode((v) => !v)}
          >
            {reorderMode ? "Done reordering" : "Reorder"}
          </Btn>
          <Btn variant="primary" icon={Plus} onClick={openNew}>Add package</Btn>
        </div>
      </div>

      <div className="admin-toolbar">
        <div style={{ position: "relative", flex: 1, maxWidth: 280 }}>
          <Search size={13} style={{ position: "absolute", left: 10, top: 10, color: "var(--text-muted)" }} />
          <input
            className="admin-input"
            style={{ paddingLeft: 30 }}
            value={search}
            onChange={(e) => { setPage(1); setSearch(e.target.value); }}
            placeholder="Search packages…"
          />
        </div>
        <select className="admin-select" value={category} onChange={(e) => { setPage(1); setCategory(e.target.value); }} style={{ width: "auto" }}>
          <option value="all">All categories</option>
          {["hemat", "bintang4", "tabungan", "ramadhan", "group"].map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="admin-filter-tabs">
        {(["all", "active", "inactive"] as const).map((s) => (
          <button
            key={s}
            type="button"
            className={`admin-filter-tab ${status === s ? "active" : ""}`}
            onClick={() => { setPage(1); setStatus(s); }}
          >
            {s === "all" ? "All" : s === "active" ? "Active" : "Inactive"}
          </button>
        ))}
      </div>

      <div className="admin-card" style={{ padding: reorderMode ? 14 : 0 }}>
        {loading ? (
          <div className="admin-empty">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="admin-empty">No packages found.</div>
        ) : reorderMode ? (
          <SortableList
            items={rows}
            onReorder={handleReorder}
            renderItem={(r) => (
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
                <strong style={{ flex: 1 }}>{r.name}</strong>
                <Badge color={CAT_COL[r.category] || "gray"}>{r.category}</Badge>
                <span style={{ color: "var(--text-muted)" }}>#{r.display_order}</span>
              </div>
            )}
          />
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Package</th>
                  <th>Category</th>
                  <th>Tag</th>
                  <th>Price</th>
                  <th>Featured</th>
                  <th>Active</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        {r.cover_image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={r.cover_image_url}
                            alt=""
                            width={44}
                            height={32}
                            style={{
                              width: 44,
                              height: 32,
                              objectFit: "cover",
                              borderRadius: 6,
                              flexShrink: 0,
                              background: "var(--bg-muted)",
                            }}
                          />
                        ) : (
                          <span
                            style={{
                              width: 44,
                              height: 32,
                              borderRadius: 6,
                              background: "var(--bg-muted)",
                              flexShrink: 0,
                            }}
                            aria-hidden
                          />
                        )}
                        <div>
                          <div style={{ fontWeight: 500, fontSize: 13 }}>{r.name}</div>
                          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>/{r.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td><Badge color={CAT_COL[r.category] || "gray"}>{r.category}</Badge></td>
                    <td style={{ fontSize: 12 }}>{r.tag_line || "—"}</td>
                    <td style={{ fontSize: 12 }}>{r.price_display_text || "—"}</td>
                    <td><Toggle checked={r.is_featured} onChange={(v) => void toggle(r.id, "is_featured", v)} /></td>
                    <td><Toggle checked={r.is_active} onChange={(v) => void toggle(r.id, "is_active", v)} /></td>
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
          <div style={{ display: "flex", justifyContent: "space-between", padding: 12, borderTop: "0.5px solid var(--border)" }}>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{total} total</span>
            <div style={{ display: "flex", gap: 8 }}>
              <Btn disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</Btn>
              <Btn disabled={page * 25 >= total} onClick={() => setPage((p) => p + 1)}>Next</Btn>
            </div>
          </div>
        )}
      </div>

      {modal && (
        <Modal title={modal === "new" ? "Add package" : "Edit package"} onClose={() => setModal(null)} width={640}>
          <div className="admin-grid-2">
            <Field label="Package name" required error={errors.name}>
              <input className="admin-input" value={form.name} onChange={set("name")} />
            </Field>
            <Field label="Slug" error={errors.slug}>
              <input className="admin-input" value={form.slug} onChange={set("slug")} placeholder="auto from name" />
            </Field>
          </div>
          <div className="admin-grid-2">
            <Field label="Category" error={errors.category}>
              <select className="admin-select" value={form.category} onChange={set("category")}>
                {["hemat", "bintang4", "tabungan", "ramadhan", "group"].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Tag line" error={errors.tag_line}>
              <input className="admin-input" value={form.tag_line} onChange={set("tag_line")} />
            </Field>
          </div>

          <Field label="Description" error={errors.description}>
            <textarea
              className="admin-textarea"
              rows={3}
              value={form.description}
              onChange={set("description")}
              placeholder="Short summary shown under the package title"
            />
          </Field>

          <Field label="Package details" error={errors.detail_text}>
            <textarea
              className="admin-textarea"
              rows={8}
              value={form.detail_text}
              onChange={set("detail_text")}
              placeholder="Full details: pricing tiers, hotels, include / exclude…"
            />
          </Field>

          <div className="admin-grid-2">
            <Field label="Hotel dist. (m)" error={errors.hotel_distance_m}>
              <input className="admin-input" type="number" value={form.hotel_distance_m} onChange={set("hotel_distance_m")} />
            </Field>
            <Field label="Flight type" error={errors.flight_type}>
              <input className="admin-input" value={form.flight_type} onChange={set("flight_type")} />
            </Field>
          </div>
          <div className="admin-grid-2">
            <Field label="Price mode" error={errors.price_mode}>
              <select className="admin-select" value={form.price_mode} onChange={set("price_mode")}>
                <option value="contact">contact</option>
                <option value="number">number</option>
              </select>
            </Field>
            <Field label="Price display text" error={errors.price_display_text}>
              <input className="admin-input" value={form.price_display_text} onChange={set("price_display_text")} />
            </Field>
          </div>

          <Field label="Cover image (4:5 thumbnail)" error={errors.cover_image_url}>
            {form.cover_image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={form.cover_image_url}
                alt="Package cover preview"
                style={{
                  width: 128,
                  height: 160,
                  objectFit: "cover",
                  borderRadius: 10,
                  marginBottom: 10,
                  border: "1px solid var(--border)",
                  display: "block",
                }}
              />
            ) : null}
            <input
              className="admin-input"
              type="url"
              value={form.cover_image_url}
              onChange={set("cover_image_url")}
              placeholder="https://… or upload below"
            />
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <label className="admin-btn secondary" style={{ cursor: "pointer", flex: 1 }}>
                <Upload size={13} />
                {uploading ? "Uploading…" : "Upload image"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  hidden
                  disabled={uploading}
                  onChange={(event) => {
                    void uploadCover(event.target.files?.[0]);
                    event.currentTarget.value = "";
                  }}
                />
              </label>
              <button
                type="button"
                className="admin-btn secondary"
                title="Clear cover image"
                onClick={() => setForm((p) => ({ ...p, cover_image_url: "" }))}
              >
                <RotateCcw size={13} />
                Clear
              </button>
            </div>
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
              {saving ? "Saving…" : "Save package"}
            </Btn>
          </div>
        </Modal>
      )}

      {deleteId != null && (
        <ConfirmDialog
          title="Delete package"
          message="Soft-delete this package? It will no longer appear on the public site."
          onConfirm={() => void confirmDelete()}
          onCancel={() => setDeleteId(null)}
          confirmLabel="Delete"
          loading={deleting}
        />
      )}
    </div>
  );
}
