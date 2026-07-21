"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Save, GripVertical } from "lucide-react";
import { Badge } from "@/components/admin/ui/Badge";
import { Toggle } from "@/components/admin/ui/Toggle";
import { Btn } from "@/components/admin/ui/Btn";
import { Modal } from "@/components/admin/ui/Modal";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import { Field } from "@/components/admin/ui/Field";
import { useToast } from "@/components/admin/ui/Toast";
import { SortableList } from "@/components/admin/dnd/SortableList";
import { CTX_COL } from "@/components/admin/lib/colors";
import { fetchJson, issuesToFieldErrors } from "@/components/admin/lib/fetch-json";
import type { Faq, FaqCategory } from "@/types/db";

type Form = {
  id?: number;
  question: string;
  answer: string;
  category: FaqCategory;
  is_active: boolean;
};

const EMPTY: Form = {
  question: "",
  answer: "",
  category: "general",
  is_active: true,
};

export function FaqsClient() {
  const { showToast } = useToast();
  const [rows, setRows] = useState<Faq[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"new" | "edit" | null>(null);
  const [form, setForm] = useState<Form>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [reorderMode, setReorderMode] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      per_page: "25",
      category,
      status: "all",
    });
    const { ok, json } = await fetchJson<{ data?: Faq[]; total?: number }>(`/api/faqs?${params}`);
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

  function openEdit(r: Faq) {
    setForm({
      id: r.id,
      question: r.question,
      answer: r.answer,
      category: r.category,
      is_active: r.is_active,
    });
    setErrors({});
    setModal("edit");
  }

  async function save() {
    setSaving(true);
    setErrors({});
    const body = {
      question: form.question.trim(),
      answer: form.answer.trim(),
      category: form.category,
      is_active: form.is_active,
    };
    const url = modal === "edit" && form.id ? `/api/faqs/${form.id}` : `/api/faqs`;
    const method = modal === "edit" ? "PUT" : "POST";
    const { ok, json } = await fetchJson(url, { method, body: JSON.stringify(body) });
    setSaving(false);
    if (!ok) {
      if (json.issues) setErrors(issuesToFieldErrors(json.issues));
      showToast(json.error || "Save failed", "error");
      return;
    }
    showToast("FAQ saved");
    setModal(null);
    void load();
  }

  async function toggleActive(r: Faq, value: boolean) {
    const { ok, json } = await fetchJson(`/api/faqs/${r.id}`, {
      method: "PUT",
      body: JSON.stringify({
        question: r.question,
        answer: r.answer,
        category: r.category,
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
    const res = await fetch(`/api/faqs/${deleteId}`, { method: "DELETE" });
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

  async function handleReorder(orderedIds: number[]) {
    const { ok, json } = await fetchJson("/api/faqs/reorder", {
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

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h2>FAQ</h2>
          <p>Questions shown in accordion sections on the public site.</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn
            variant={reorderMode ? "primary" : "secondary"}
            icon={GripVertical}
            onClick={() => setReorderMode((v) => !v)}
          >
            {reorderMode ? "Done reordering" : "Reorder"}
          </Btn>
          <Btn variant="primary" icon={Plus} onClick={openNew}>Add FAQ</Btn>
        </div>
      </div>

      <div className="admin-filter-tabs">
        {["all", "general", "halal-tour", "korporat"].map((c) => (
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

      <div className="admin-card" style={{ padding: reorderMode ? 14 : 0 }}>
        {loading ? (
          <div className="admin-empty">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="admin-empty">No FAQs found.</div>
        ) : reorderMode ? (
          <SortableList
            items={rows}
            onReorder={handleReorder}
            renderItem={(r) => (
              <div style={{ fontSize: 13 }}>
                <strong>{r.question}</strong>
                <div style={{ marginTop: 4 }}>
                  <Badge color={CTX_COL[r.category] || "gray"}>{r.category}</Badge>
                </div>
              </div>
            )}
          />
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Question</th>
                  <th>Category</th>
                  <th>Active</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td style={{ fontSize: 13, maxWidth: 420 }}>{r.question}</td>
                    <td><Badge color={CTX_COL[r.category] || "gray"}>{r.category}</Badge></td>
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
        <Modal title={modal === "new" ? "Add FAQ" : "Edit FAQ"} onClose={() => setModal(null)} width={560}>
          <Field label="Category" error={errors.category}>
            <select className="admin-select" value={form.category} onChange={set("category")}>
              {["general", "halal-tour", "korporat"].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Question" required error={errors.question}>
            <input className="admin-input" value={form.question} onChange={set("question")} />
          </Field>
          <Field label="Answer" required error={errors.answer}>
            <textarea className="admin-textarea" rows={5} value={form.answer} onChange={set("answer")} />
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
          title="Delete FAQ"
          message="Soft-delete this FAQ?"
          onConfirm={() => void confirmDelete()}
          onCancel={() => setDeleteId(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}
