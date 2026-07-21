"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Save } from "lucide-react";
import { Badge } from "@/components/admin/ui/Badge";
import { Btn } from "@/components/admin/ui/Btn";
import { Modal } from "@/components/admin/ui/Modal";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import { Field } from "@/components/admin/ui/Field";
import { useToast } from "@/components/admin/ui/Toast";
import { SCHED_ST } from "@/components/admin/lib/colors";
import { fetchJson, issuesToFieldErrors } from "@/components/admin/lib/fetch-json";
import type { DepartureScheduleWithPackage, Package, ScheduleStatus } from "@/types/db";

type Form = {
  id?: number;
  package_id: string;
  departure_date: string;
  return_date: string;
  departure_city: string;
  airline: string;
  total_seats: string;
  seats_remaining: string;
  status: ScheduleStatus;
};

const EMPTY: Form = {
  package_id: "",
  departure_date: "",
  return_date: "",
  departure_city: "CGK",
  airline: "",
  total_seats: "45",
  seats_remaining: "45",
  status: "upcoming",
};

export function SchedulesClient() {
  const { showToast } = useToast();
  const [rows, setRows] = useState<DepartureScheduleWithPackage[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"new" | "edit" | null>(null);
  const [form, setForm] = useState<Form>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadPackages = useCallback(async () => {
    const { ok, json } = await fetchJson<{ data?: Package[] }>(`/api/packages?per_page=100&status=all`);
    if (ok) setPackages(json.data ?? []);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), per_page: "25", status: statusFilter });
    const { ok, json } = await fetchJson<{ data?: DepartureScheduleWithPackage[]; total?: number }>(
      `/api/schedules?${params}`
    );
    if (!ok) {
      showToast(json.error || "Failed to load schedules", "error");
      setLoading(false);
      return;
    }
    setRows(json.data ?? []);
    setTotal(json.total ?? 0);
    setLoading(false);
  }, [page, statusFilter, showToast]);

  useEffect(() => {
    void loadPackages();
  }, [loadPackages]);

  useEffect(() => {
    void load();
  }, [load]);

  function openNew() {
    setForm({ ...EMPTY, package_id: packages[0] ? String(packages[0].id) : "" });
    setErrors({});
    setModal("new");
  }

  function openEdit(r: DepartureScheduleWithPackage) {
    setForm({
      id: r.id,
      package_id: String(r.package_id),
      departure_date: r.departure_date?.slice(0, 10) ?? "",
      return_date: r.return_date?.slice(0, 10) ?? "",
      departure_city: r.departure_city ?? "CGK",
      airline: r.airline ?? "",
      total_seats: String(r.total_seats),
      seats_remaining: String(r.seats_remaining),
      status: r.status,
    });
    setErrors({});
    setModal("edit");
  }

  async function save() {
    setSaving(true);
    setErrors({});
    const body = {
      package_id: Number(form.package_id),
      departure_date: form.departure_date,
      return_date: form.return_date,
      departure_city: form.departure_city,
      airline: form.airline.trim() || null,
      total_seats: Number(form.total_seats),
      seats_remaining: Number(form.seats_remaining),
      status: form.status,
    };
    const url = modal === "edit" && form.id ? `/api/schedules/${form.id}` : `/api/schedules`;
    const method = modal === "edit" ? "PUT" : "POST";
    const { ok, json } = await fetchJson(url, { method, body: JSON.stringify(body) });
    setSaving(false);
    if (!ok) {
      if (json.issues) setErrors(issuesToFieldErrors(json.issues));
      showToast(json.error || "Save failed", "error");
      return;
    }
    showToast("Schedule saved");
    setModal(null);
    void load();
  }

  async function confirmDelete() {
    if (deleteId == null) return;
    setDeleting(true);
    const res = await fetch(`/api/schedules/${deleteId}`, { method: "DELETE" });
    setDeleting(false);
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      showToast((json as { error?: string }).error || "Delete failed", "error");
      setDeleteId(null);
      return;
    }
    showToast("Schedule deleted");
    setDeleteId(null);
    void load();
  }

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h2>Departure schedules</h2>
          <p>Track seat availability and departure status.</p>
        </div>
        <Btn variant="primary" icon={Plus} onClick={openNew}>Add schedule</Btn>
      </div>

      <div className="admin-filter-tabs">
        {["all", "upcoming", "ongoing", "completed", "cancelled"].map((s) => (
          <button
            key={s}
            type="button"
            className={`admin-filter-tab ${statusFilter === s ? "active" : ""}`}
            onClick={() => { setPage(1); setStatusFilter(s); }}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="admin-card" style={{ padding: 0 }}>
        {loading ? (
          <div className="admin-empty">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="admin-empty">No schedules found.</div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Package</th>
                  <th>Departure</th>
                  <th>Return</th>
                  <th>From</th>
                  <th>Airline</th>
                  <th>Seats</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 500, fontSize: 12 }}>{r.package_name}</td>
                    <td style={{ fontSize: 12 }}>{r.departure_date?.slice(0, 10)}</td>
                    <td style={{ fontSize: 12 }}>{r.return_date?.slice(0, 10)}</td>
                    <td><Badge color="gray">{r.departure_city}</Badge></td>
                    <td style={{ fontSize: 11 }}>{r.airline || "—"}</td>
                    <td style={{ fontSize: 12 }}>
                      {r.seats_remaining}/{r.total_seats}
                      {r.seats_remaining <= 5 && r.status === "upcoming" && (
                        <Badge color="red">low</Badge>
                      )}
                    </td>
                    <td><Badge color={SCHED_ST[r.status] || "gray"}>{r.status}</Badge></td>
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
        <Modal title={modal === "new" ? "Add schedule" : "Edit schedule"} onClose={() => setModal(null)}>
          <Field label="Package" required error={errors.package_id}>
            <select className="admin-select" value={form.package_id} onChange={set("package_id")}>
              <option value="">Select package</option>
              {packages.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </Field>
          <div className="admin-grid-2">
            <Field label="Departure" required error={errors.departure_date}>
              <input className="admin-input" type="date" value={form.departure_date} onChange={set("departure_date")} />
            </Field>
            <Field label="Return" required error={errors.return_date}>
              <input className="admin-input" type="date" value={form.return_date} onChange={set("return_date")} />
            </Field>
          </div>
          <div className="admin-grid-2">
            <Field label="City" error={errors.departure_city}>
              <select className="admin-select" value={form.departure_city} onChange={set("departure_city")}>
                <option value="CGK">Jakarta (CGK)</option>
                <option value="BDO">Bandung (BDO)</option>
                <option value="SUB">Surabaya (SUB)</option>
              </select>
            </Field>
            <Field label="Airline" error={errors.airline}>
              <input className="admin-input" value={form.airline} onChange={set("airline")} />
            </Field>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <Field label="Total seats" error={errors.total_seats}>
              <input className="admin-input" type="number" value={form.total_seats} onChange={set("total_seats")} />
            </Field>
            <Field label="Remaining" error={errors.seats_remaining}>
              <input className="admin-input" type="number" value={form.seats_remaining} onChange={set("seats_remaining")} />
            </Field>
            <Field label="Status" error={errors.status}>
              <select className="admin-select" value={form.status} onChange={set("status")}>
                {["upcoming", "ongoing", "completed", "cancelled"].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </Field>
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
          title="Delete schedule"
          message="Soft-delete this departure schedule?"
          onConfirm={() => void confirmDelete()}
          onCancel={() => setDeleteId(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}
