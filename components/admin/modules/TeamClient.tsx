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
import { DEPT_COL } from "@/components/admin/lib/colors";
import { fetchJson, issuesToFieldErrors } from "@/components/admin/lib/fetch-json";
import type { Department, TeamMember } from "@/types/db";

const DEPTS: Department[] = [
  "Management",
  "Marketing",
  "Customer Service",
  "Operations",
  "Finance",
];

type Form = {
  id?: number;
  full_name: string;
  role_title: string;
  department: Department;
  bio: string;
  photo_url: string;
  is_active: boolean;
};

const EMPTY: Form = {
  full_name: "",
  role_title: "",
  department: "Operations",
  bio: "",
  photo_url: "",
  is_active: true,
};

export function TeamClient() {
  const { showToast } = useToast();
  const [rows, setRows] = useState<TeamMember[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [department, setDepartment] = useState("all");
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
      status: "all",
      department,
    });
    const { ok, json } = await fetchJson<{ data?: TeamMember[]; total?: number }>(
      `/api/team?${params}`
    );
    if (!ok) {
      showToast(json.error || "Failed to load", "error");
      setLoading(false);
      return;
    }
    setRows(json.data ?? []);
    setTotal(json.total ?? 0);
    setLoading(false);
  }, [page, department, showToast]);

  useEffect(() => {
    void load();
  }, [load]);

  function openNew() {
    setForm(EMPTY);
    setErrors({});
    setModal("new");
  }

  function openEdit(r: TeamMember) {
    setForm({
      id: r.id,
      full_name: r.full_name,
      role_title: r.role_title,
      department: r.department,
      bio: r.bio ?? "",
      photo_url: r.photo_url ?? "",
      is_active: r.is_active,
    });
    setErrors({});
    setModal("edit");
  }

  async function save() {
    setSaving(true);
    setErrors({});
    const body = {
      full_name: form.full_name.trim(),
      role_title: form.role_title.trim(),
      department: form.department,
      bio: form.bio.trim() || null,
      photo_url: form.photo_url.trim() || null,
      is_active: form.is_active,
    };
    const url = modal === "edit" && form.id ? `/api/team/${form.id}` : `/api/team`;
    const method = modal === "edit" ? "PUT" : "POST";
    const { ok, json } = await fetchJson(url, { method, body: JSON.stringify(body) });
    setSaving(false);
    if (!ok) {
      if (json.issues) setErrors(issuesToFieldErrors(json.issues));
      showToast(json.error || "Save failed", "error");
      return;
    }
    showToast("Team member saved");
    setModal(null);
    void load();
  }

  async function toggleActive(r: TeamMember, value: boolean) {
    const { ok, json } = await fetchJson(`/api/team/${r.id}`, {
      method: "PUT",
      body: JSON.stringify({
        full_name: r.full_name,
        role_title: r.role_title,
        department: r.department,
        photo_url: r.photo_url,
        bio: r.bio,
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
    const res = await fetch(`/api/team/${deleteId}`, { method: "DELETE" });
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
          <h2>Team</h2>
          <p>People shown on the About / Team section.</p>
        </div>
        <Btn variant="primary" icon={Plus} onClick={openNew}>Add member</Btn>
      </div>

      <div className="admin-filter-tabs">
        {["all", ...DEPTS].map((d) => (
          <button
            key={d}
            type="button"
            className={`admin-filter-tab ${department === d ? "active" : ""}`}
            onClick={() => { setPage(1); setDepartment(d); }}
          >
            {d}
          </button>
        ))}
      </div>

      <div className="admin-card" style={{ padding: 0 }}>
        {loading ? (
          <div className="admin-empty">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="admin-empty">No team members.</div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Active</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 500, fontSize: 13 }}>{r.full_name}</td>
                    <td style={{ fontSize: 12 }}>{r.role_title}</td>
                    <td><Badge color={DEPT_COL[r.department] || "gray"}>{r.department}</Badge></td>
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
        <Modal title={modal === "new" ? "Add team member" : "Edit team member"} onClose={() => setModal(null)}>
          <Field label="Full name" required error={errors.full_name}>
            <input className="admin-input" value={form.full_name} onChange={set("full_name")} />
          </Field>
          <Field label="Role title" required error={errors.role_title}>
            <input className="admin-input" value={form.role_title} onChange={set("role_title")} />
          </Field>
          <Field label="Department" error={errors.department}>
            <select className="admin-select" value={form.department} onChange={set("department")}>
              {DEPTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </Field>
          <Field label="Photo URL" error={errors.photo_url}>
            <input className="admin-input" value={form.photo_url} onChange={set("photo_url")} placeholder="https://…" />
          </Field>
          <Field label="Bio" error={errors.bio}>
            <textarea className="admin-textarea" rows={3} value={form.bio} onChange={set("bio")} />
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
          title="Delete member"
          message="Soft-delete this team member?"
          onConfirm={() => void confirmDelete()}
          onCancel={() => setDeleteId(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}
