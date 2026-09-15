"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Plus, Trash2, Save, Upload } from "lucide-react";
import { Badge } from "@/components/admin/ui/Badge";
import { Toggle } from "@/components/admin/ui/Toggle";
import { Btn } from "@/components/admin/ui/Btn";
import { Modal } from "@/components/admin/ui/Modal";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import { Field } from "@/components/admin/ui/Field";
import { useToast } from "@/components/admin/ui/Toast";
import { CTX_COL } from "@/components/admin/lib/colors";
import { uploadAdminFile } from "@/components/admin/lib/compress-image";
import { fetchJson, issuesToFieldErrors } from "@/components/admin/lib/fetch-json";
import type { GalleryCategory, GalleryItem } from "@/types/db";

type Form = {
  id?: number;
  image_url: string;
  alt_text: string;
  caption: string;
  category: GalleryCategory;
  is_active: boolean;
};

const EMPTY: Form = {
  image_url: "",
  alt_text: "",
  caption: "",
  category: "umroh",
  is_active: true,
};

export function GalleryClient() {
  const { showToast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<GalleryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"new" | "edit" | null>(null);
  const [form, setForm] = useState<Form>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      per_page: "25",
      category,
      status: "all",
    });
    const { ok, json } = await fetchJson<{ data?: GalleryItem[]; total?: number }>(
      `/api/gallery?${params}`
    );
    if (!ok) {
      showToast(json.error || "Failed to load", "error");
      setLoading(false);
      return;
    }
    setRows(json.data ?? []);
    setTotal(json.total ?? 0);
    setLoading(false);
  }, [page, category, showToast]);

  useEffect(() => {
    void load();
  }, [load]);

  function openNew() {
    setForm(EMPTY);
    setErrors({});
    setModal("new");
  }

  function openEdit(r: GalleryItem) {
    setForm({
      id: r.id,
      image_url: r.image_url,
      alt_text: r.alt_text,
      caption: r.caption ?? "",
      category: r.category,
      is_active: r.is_active,
    });
    setErrors({});
    setModal("edit");
  }

  async function uploadFile(file: File) {
    setUploading(true);
    try {
      const data = await uploadAdminFile(file, "gallery");
      setForm((p) => ({
        ...p,
        image_url: data.url,
        alt_text: p.alt_text || file.name.replace(/\.[^.]+$/, ""),
      }));
      showToast("Image uploaded");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Upload failed", "error");
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    setSaving(true);
    setErrors({});
    const body = {
      image_url: form.image_url.trim(),
      alt_text: form.alt_text.trim(),
      caption: form.caption.trim() || null,
      category: form.category,
      is_active: form.is_active,
    };
    const url = modal === "edit" && form.id ? `/api/gallery/${form.id}` : `/api/gallery`;
    const method = modal === "edit" ? "PUT" : "POST";
    const { ok, json } = await fetchJson(url, { method, body: JSON.stringify(body) });
    setSaving(false);
    if (!ok) {
      if (json.issues) setErrors(issuesToFieldErrors(json.issues));
      showToast(json.error || "Save failed", "error");
      return;
    }
    showToast("Gallery item saved");
    setModal(null);
    void load();
  }

  async function toggleActive(r: GalleryItem, value: boolean) {
    const { ok, json } = await fetchJson(`/api/gallery/${r.id}`, {
      method: "PUT",
      body: JSON.stringify({
        image_url: r.image_url,
        thumbnail_url: r.thumbnail_url,
        alt_text: r.alt_text,
        caption: r.caption,
        category: r.category,
        file_size_kb: r.file_size_kb,
        width_px: r.width_px,
        height_px: r.height_px,
        display_order: r.display_order,
        is_active: value,
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
    const res = await fetch(`/api/gallery/${deleteId}`, { method: "DELETE" });
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
          <h2>Gallery</h2>
          <p>Upload images, then set alt text and category.</p>
        </div>
        <Btn variant="primary" icon={Plus} onClick={openNew}>Add image</Btn>
      </div>

      <div className="admin-filter-tabs">
        {["all", "umroh", "korporat", "general"].map((c) => (
          <button
            key={c}
            type="button"
            className={`admin-filter-tab ${category === c ? "active" : ""}`}
            onClick={() => { setPage(1); setCategory(c); }}
          >
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="admin-empty">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="admin-empty">No gallery items.</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
          {rows.map((r) => (
            <div key={r.id} className="admin-card" style={{ padding: 10 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={r.image_url}
                alt={r.alt_text}
                style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 8, marginBottom: 8 }}
              />
              <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 4 }}>{r.caption || r.alt_text}</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
                <Badge color={CTX_COL[r.category] || "gray"}>{r.category}</Badge>
                <Toggle checked={r.is_active} onChange={(v) => void toggleActive(r, v)} />
              </div>
              <div style={{ display: "flex", gap: 5, marginTop: 8 }}>
                <Btn variant="ghost" onClick={() => openEdit(r)}>Edit</Btn>
                <Btn variant="ghost" danger onClick={() => setDeleteId(r.id)}><Trash2 size={12} /></Btn>
              </div>
            </div>
          ))}
        </div>
      )}

      {total > 25 && (
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{total} total</span>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</Btn>
            <Btn disabled={page * 25 >= total} onClick={() => setPage((p) => p + 1)}>Next</Btn>
          </div>
        </div>
      )}

      {modal && (
        <Modal title={modal === "new" ? "Add gallery item" : "Edit gallery item"} onClose={() => setModal(null)}>
          <Field label="Image" required error={errors.image_url}>
            {form.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.image_url} alt="" style={{ width: "100%", maxHeight: 160, objectFit: "cover", borderRadius: 8, marginBottom: 8 }} />
            ) : null}
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              style={{ display: "none" }}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void uploadFile(f);
              }}
            />
            <Btn icon={Upload} onClick={() => fileRef.current?.click()} disabled={uploading}>
              {uploading ? "Uploading…" : "Upload image"}
            </Btn>
            <input
              className="admin-input"
              style={{ marginTop: 8 }}
              value={form.image_url}
              onChange={set("image_url")}
              placeholder="Or paste image URL"
            />
          </Field>
          <Field label="Alt text" required error={errors.alt_text}>
            <input className="admin-input" value={form.alt_text} onChange={set("alt_text")} />
          </Field>
          <Field label="Caption" error={errors.caption}>
            <input className="admin-input" value={form.caption} onChange={set("caption")} />
          </Field>
          <Field label="Category" error={errors.category}>
            <select className="admin-select" value={form.category} onChange={set("category")}>
              {["umroh", "korporat", "general"].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>
          <label style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, marginBottom: 18, cursor: "pointer" }}>
            <Toggle checked={form.is_active} onChange={(v) => setForm((p) => ({ ...p, is_active: v }))} />
            Active
          </label>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Btn onClick={() => setModal(null)}>Cancel</Btn>
            <Btn variant="primary" icon={Save} onClick={save} disabled={saving || !form.image_url}>
              {saving ? "Saving…" : "Save"}
            </Btn>
          </div>
        </Modal>
      )}

      {deleteId != null && (
        <ConfirmDialog
          title="Delete image"
          message="Soft-delete this gallery item?"
          onConfirm={() => void confirmDelete()}
          onCancel={() => setDeleteId(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}
