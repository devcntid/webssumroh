"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Save, Copy } from "lucide-react";
import { Badge } from "@/components/admin/ui/Badge";
import { Toggle } from "@/components/admin/ui/Toggle";
import { Btn } from "@/components/admin/ui/Btn";
import { Modal } from "@/components/admin/ui/Modal";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import { Field } from "@/components/admin/ui/Field";
import { useToast } from "@/components/admin/ui/Toast";
import { ROLE_COL } from "@/components/admin/lib/colors";
import { fetchJson, issuesToFieldErrors } from "@/components/admin/lib/fetch-json";
import type { AdminRole, AdminUserPublic } from "@/types/db";

type Form = {
  id?: number;
  full_name: string;
  email: string;
  role: AdminRole;
  is_active: boolean;
  password: string;
};

const EMPTY: Form = {
  full_name: "",
  email: "",
  role: "editor",
  is_active: true,
  password: "",
};

export function UsersClient() {
  const { showToast } = useToast();
  const [rows, setRows] = useState<AdminUserPublic[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"new" | "edit" | null>(null);
  const [form, setForm] = useState<Form>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), per_page: "25" });
    const { ok, json } = await fetchJson<{ data?: AdminUserPublic[]; total?: number }>(
      `/api/users?${params}`
    );
    if (!ok) {
      showToast(json.error || "Failed to load users", "error");
      setLoading(false);
      return;
    }
    setRows(json.data ?? []);
    setTotal(json.total ?? 0);
    setLoading(false);
  }, [page, showToast]);

  useEffect(() => {
    void load();
  }, [load]);

  function openNew() {
    setForm(EMPTY);
    setErrors({});
    setModal("new");
  }

  function openEdit(r: AdminUserPublic) {
    setForm({
      id: r.id,
      full_name: r.full_name,
      email: r.email,
      role: r.role,
      is_active: r.is_active,
      password: "",
    });
    setErrors({});
    setModal("edit");
  }

  async function save() {
    setSaving(true);
    setErrors({});
    if (modal === "new") {
      const body = {
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        role: form.role,
        is_active: form.is_active,
      };
      const { ok, json } = await fetchJson<AdminUserPublic & { temp_password?: string }>(
        `/api/users`,
        { method: "POST", body: JSON.stringify(body) }
      );
      setSaving(false);
      if (!ok) {
        if (json.issues) setErrors(issuesToFieldErrors(json.issues));
        showToast(json.error || "Create failed", "error");
        return;
      }
      setModal(null);
      setTempPassword(json.temp_password ?? null);
      showToast("User created — copy the temporary password");
      void load();
      return;
    }

    const body: Record<string, unknown> = {
      full_name: form.full_name.trim(),
      email: form.email.trim(),
      role: form.role,
      is_active: form.is_active,
    };
    if (form.password.trim()) body.password = form.password.trim();

    const { ok, json } = await fetchJson(`/api/users/${form.id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
    setSaving(false);
    if (!ok) {
      if (json.issues) setErrors(issuesToFieldErrors(json.issues));
      showToast(json.error || "Update failed", "error");
      return;
    }
    showToast("User updated");
    setModal(null);
    void load();
  }

  async function toggleActive(r: AdminUserPublic, value: boolean) {
    const { ok, json } = await fetchJson(`/api/users/${r.id}`, {
      method: "PUT",
      body: JSON.stringify({ is_active: value }),
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
    const res = await fetch(`/api/users/${deleteId}`, { method: "DELETE" });
    setDeleting(false);
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      showToast((json as { error?: string }).error || "Delete failed", "error");
      setDeleteId(null);
      return;
    }
    showToast("User deleted");
    setDeleteId(null);
    void load();
  }

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h2>User management</h2>
          <p>Admin accounts and roles. Super admin only.</p>
        </div>
        <Btn variant="primary" icon={Plus} onClick={openNew}>Add user</Btn>
      </div>

      <div className="admin-card" style={{ padding: 0 }}>
        {loading ? (
          <div className="admin-empty">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="admin-empty">No users.</div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Last login</th>
                  <th>Active</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 500, fontSize: 13 }}>{r.full_name}</td>
                    <td style={{ fontSize: 12 }}>{r.email}</td>
                    <td><Badge color={ROLE_COL[r.role] || "gray"}>{r.role}</Badge></td>
                    <td style={{ fontSize: 11, color: "var(--text-muted)" }}>
                      {r.last_login_at?.slice(0, 16).replace("T", " ") || "—"}
                    </td>
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
        <Modal title={modal === "new" ? "Add user" : "Edit user"} onClose={() => setModal(null)}>
          <Field label="Full name" required error={errors.full_name}>
            <input className="admin-input" value={form.full_name} onChange={set("full_name")} />
          </Field>
          <Field label="Email" required error={errors.email}>
            <input className="admin-input" type="email" value={form.email} onChange={set("email")} />
          </Field>
          <Field label="Role" error={errors.role}>
            <select className="admin-select" value={form.role} onChange={set("role")}>
              {["super_admin", "admin", "editor", "cs_agent"].map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </Field>
          {modal === "edit" && (
            <Field label="New password (optional)" error={errors.password}>
              <input
                className="admin-input"
                type="password"
                value={form.password}
                onChange={set("password")}
                placeholder="Leave blank to keep"
                minLength={8}
              />
            </Field>
          )}
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

      {tempPassword && (
        <Modal title="Temporary password" onClose={() => setTempPassword(null)} width={420}>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 0 }}>
            Copy this password now. It will not be shown again.
          </p>
          <div style={{
            fontFamily: "ui-monospace, monospace",
            fontSize: 16,
            padding: "12px 14px",
            background: "var(--surface-0)",
            borderRadius: 8,
            marginBottom: 14,
            wordBreak: "break-all",
          }}>
            {tempPassword}
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Btn
              icon={Copy}
              onClick={() => {
                void navigator.clipboard.writeText(tempPassword);
                showToast("Copied");
              }}
            >
              Copy
            </Btn>
            <Btn variant="primary" onClick={() => setTempPassword(null)}>Done</Btn>
          </div>
        </Modal>
      )}

      {deleteId != null && (
        <ConfirmDialog
          title="Delete user"
          message="Soft-delete this admin user? They will no longer be able to sign in."
          onConfirm={() => void confirmDelete()}
          onCancel={() => setDeleteId(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}
