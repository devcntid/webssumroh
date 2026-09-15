"use client";

/**
 * MediaClient — admin media library
 * Upload images, store title + public URL, copy URL for use on website pages.
 */

import { useCallback, useEffect, useState } from "react";
import { Check, Copy, Plus, Search, Trash2, Upload } from "lucide-react";
import { Btn } from "@/components/admin/ui/Btn";
import { Modal } from "@/components/admin/ui/Modal";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import { Field } from "@/components/admin/ui/Field";
import { useToast } from "@/components/admin/ui/Toast";
import { fetchJson, issuesToFieldErrors } from "@/components/admin/lib/fetch-json";
import type { MediaAsset } from "@/types/db";

type Form = {
  id?: number;
  title: string;
  image_url: string;
  alt_text: string;
  file_size_kb: number | null;
};

const EMPTY: Form = {
  title: "",
  image_url: "",
  alt_text: "",
  file_size_kb: null,
};

function formatBytes(kb: number | null): string {
  if (kb == null || kb <= 0) return "—";
  if (kb < 1024) return `${kb} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export function MediaClient() {
  const { showToast } = useToast();
  const [rows, setRows] = useState<MediaAsset[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"new" | "edit" | null>(null);
  const [form, setForm] = useState<Form>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      per_page: "24",
    });
    if (q) params.set("q", q);
    const { ok, json } = await fetchJson<{ data?: MediaAsset[]; total?: number }>(
      `/api/media?${params}`
    );
    if (!ok) {
      showToast(json.error || "Failed to load media", "error");
      setLoading(false);
      return;
    }
    setRows(json.data ?? []);
    setTotal(json.total ?? 0);
    setLoading(false);
  }, [page, q, showToast]);

  useEffect(() => {
    void load();
  }, [load]);

  function openNew() {
    setForm(EMPTY);
    setErrors({});
    setModal("new");
  }

  function openEdit(item: MediaAsset) {
    setForm({
      id: item.id,
      title: item.title,
      image_url: item.image_url,
      alt_text: item.alt_text ?? "",
      file_size_kb: item.file_size_kb,
    });
    setErrors({});
    setModal("edit");
  }

  async function uploadFile(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "media-library");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast((json as { error?: string }).error || `Upload failed (${res.status})`, "error");
        return;
      }
      const data = (json as { data?: { url?: string; size?: number } }).data;
      if (!data?.url) {
        showToast("Upload failed: no file URL returned", "error");
        return;
      }
      const baseName = file.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ");
      setForm((current) => ({
        ...current,
        image_url: data.url!,
        title: current.title.trim() || baseName.slice(0, 200),
        alt_text: current.alt_text.trim() || baseName.slice(0, 200),
        file_size_kb: data.size != null ? Math.max(1, Math.round(data.size / 1024)) : null,
      }));
      showToast("Image uploaded — save to add it to the library");
    } catch {
      showToast("Upload failed. Check your connection and try again.", "error");
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    setSaving(true);
    setErrors({});
    const body = {
      title: form.title.trim(),
      image_url: form.image_url.trim(),
      alt_text: form.alt_text.trim() || null,
      file_size_kb: form.file_size_kb,
    };
    const url = modal === "edit" && form.id ? `/api/media/${form.id}` : `/api/media`;
    const method = modal === "edit" ? "PUT" : "POST";
    const { ok, json } = await fetchJson(url, { method, body: JSON.stringify(body) });
    setSaving(false);
    if (!ok) {
      if (json.issues) setErrors(issuesToFieldErrors(json.issues));
      showToast(json.error || "Save failed", "error");
      return;
    }
    showToast(modal === "edit" ? "Media updated" : "Media added");
    setModal(null);
    void load();
  }

  async function confirmDelete() {
    if (deleteId == null) return;
    setDeleting(true);
    const res = await fetch(`/api/media/${deleteId}`, { method: "DELETE" });
    setDeleting(false);
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      showToast((json as { error?: string }).error || "Delete failed", "error");
      setDeleteId(null);
      return;
    }
    showToast("Media deleted");
    setDeleteId(null);
    void load();
  }

  async function copyUrl(item: MediaAsset) {
    try {
      await navigator.clipboard.writeText(item.image_url);
      setCopiedId(item.id);
      showToast("Image URL copied");
      window.setTimeout(() => setCopiedId((current) => (current === item.id ? null : current)), 1600);
    } catch {
      showToast("Could not copy URL", "error");
    }
  }

  function applySearch(event: React.FormEvent) {
    event.preventDefault();
    setPage(1);
    setQ(searchInput.trim());
  }

  const totalPages = Math.max(1, Math.ceil(total / 24));

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h2>Media library</h2>
          <p>
            Upload images and copy their public URLs for hero slides, packages, and other pages.
          </p>
        </div>
        <Btn variant="primary" icon={Plus} onClick={openNew}>
          Add media
        </Btn>
      </div>

      <form className="admin-media-toolbar" onSubmit={applySearch}>
        <div className="admin-media-search">
          <Search size={15} aria-hidden />
          <input
            className="admin-input"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search by title or URL…"
            aria-label="Search media"
          />
        </div>
        <Btn type="submit" variant="secondary">
          Search
        </Btn>
      </form>

      {loading ? (
        <div className="admin-empty">Loading media…</div>
      ) : rows.length === 0 ? (
        <div className="admin-empty">
          No media yet. Upload an image to get a reusable URL.
        </div>
      ) : (
        <>
          <div className="admin-media-grid">
            {rows.map((item) => (
              <article key={item.id} className="admin-media-card">
                <button
                  type="button"
                  className="admin-media-thumb"
                  onClick={() => openEdit(item)}
                  aria-label={`Edit ${item.title}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image_url} alt={item.alt_text || item.title} />
                </button>
                <div className="admin-media-body">
                  <strong className="admin-media-title">{item.title}</strong>
                  <code className="admin-media-url" title={item.image_url}>
                    {item.image_url}
                  </code>
                  <div className="admin-media-meta">{formatBytes(item.file_size_kb)}</div>
                  <div className="admin-media-actions">
                    <button
                      type="button"
                      className="admin-btn secondary"
                      onClick={() => void copyUrl(item)}
                    >
                      {copiedId === item.id ? <Check size={13} /> : <Copy size={13} />}
                      {copiedId === item.id ? "Copied" : "Copy URL"}
                    </button>
                    <button
                      type="button"
                      className="admin-btn ghost"
                      onClick={() => setDeleteId(item.id)}
                      aria-label={`Delete ${item.title}`}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="admin-pagination">
              <span>
                {total} item{total === 1 ? "" : "s"} · page {page} / {totalPages}
              </span>
              <div style={{ display: "flex", gap: 8 }}>
                <Btn
                  variant="secondary"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Btn>
                <Btn
                  variant="secondary"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </Btn>
              </div>
            </div>
          )}
        </>
      )}

      {modal !== null && (
        <Modal
          title={modal === "edit" ? "Edit media" : "Add media"}
          onClose={() => setModal(null)}
        >
          <Field label="Title" required error={errors.title}>
            <input
              className="admin-input"
              value={form.title}
              onChange={(event) => setForm((p) => ({ ...p, title: event.target.value }))}
              placeholder="Hero slide 1, Package cover…"
            />
          </Field>

          <Field label="Image URL" required error={errors.image_url}>
            <input
              className="admin-input"
              type="url"
              value={form.image_url}
              onChange={(event) => setForm((p) => ({ ...p, image_url: event.target.value }))}
              placeholder="https://…"
            />
          </Field>

          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            <label className="admin-btn secondary" style={{ cursor: "pointer", flex: 1 }}>
              <Upload size={13} />
              {uploading ? "Uploading…" : "Upload image"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                hidden
                disabled={uploading}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void uploadFile(file);
                  event.currentTarget.value = "";
                }}
              />
            </label>
          </div>

          {form.image_url && (
            <div className="admin-media-preview">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={form.image_url} alt="" />
            </div>
          )}

          <Field label="Alt text" error={errors.alt_text}>
            <input
              className="admin-input"
              value={form.alt_text}
              onChange={(event) => setForm((p) => ({ ...p, alt_text: event.target.value }))}
              placeholder="Short description for accessibility"
            />
          </Field>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
            <Btn variant="ghost" onClick={() => setModal(null)}>
              Cancel
            </Btn>
            <Btn variant="primary" onClick={save} disabled={saving || !form.image_url.trim()}>
              {saving ? "Saving…" : "Save media"}
            </Btn>
          </div>
        </Modal>
      )}

      {deleteId != null && (
        <ConfirmDialog
          title="Delete media?"
          message="This removes the item from the library. The uploaded file URL may still work until cleaned from storage."
          confirmLabel="Delete"
          loading={deleting}
          onConfirm={() => void confirmDelete()}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}
