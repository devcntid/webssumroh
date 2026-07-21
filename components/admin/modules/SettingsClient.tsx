"use client";

import { useCallback, useEffect, useState } from "react";
import { Save } from "lucide-react";
import { Field } from "@/components/admin/ui/Field";
import { Btn } from "@/components/admin/ui/Btn";
import { useToast } from "@/components/admin/ui/Toast";
import { fetchJson, issuesToFieldErrors } from "@/components/admin/lib/fetch-json";
import type { SiteSetting } from "@/types/db";

type Form = {
  phone_display: string;
  whatsapp_number: string;
  office_address: string;
  cs_name: string;
  ppiu_license: string;
  maps_embed_url: string;
};

const EMPTY: Form = {
  phone_display: "",
  whatsapp_number: "",
  office_address: "",
  cs_name: "",
  ppiu_license: "",
  maps_embed_url: "",
};

export function SettingsClient() {
  const { showToast } = useToast();
  const [form, setForm] = useState<Form>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { ok, json } = await fetchJson<{ data?: SiteSetting }>(`/api/site-settings`);
    if (!ok || !json.data) {
      showToast(json.error || "Failed to load settings", "error");
      setLoading(false);
      return;
    }
    const d = json.data;
    setForm({
      phone_display: d.phone_display ?? "",
      whatsapp_number: d.whatsapp_number ?? "",
      office_address: d.office_address ?? "",
      cs_name: d.cs_name ?? "",
      ppiu_license: d.ppiu_license ?? "",
      maps_embed_url: d.maps_embed_url ?? "",
    });
    setLoading(false);
  }, [showToast]);

  useEffect(() => {
    void load();
  }, [load]);

  async function save() {
    setSaving(true);
    setErrors({});
    const body = {
      ...form,
      maps_embed_url: form.maps_embed_url.trim() || null,
    };
    const { ok, json } = await fetchJson(`/api/site-settings`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
    setSaving(false);
    if (!ok) {
      if (json.issues) setErrors(issuesToFieldErrors(json.issues));
      showToast(json.error || "Failed to save", "error");
      return;
    }
    showToast("Settings saved");
  }

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  if (loading) return <div className="admin-empty">Loading settings…</div>;

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h2>Site settings</h2>
          <p>Contact details and license shown on the public site.</p>
        </div>
        <Btn variant="primary" icon={Save} onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save settings"}
        </Btn>
      </div>

      <div className="admin-card" style={{ maxWidth: 640 }}>
        <Field label="Phone display" required error={errors.phone_display}>
          <input className="admin-input" value={form.phone_display} onChange={set("phone_display")} />
        </Field>
        <Field label="WhatsApp number" required error={errors.whatsapp_number}>
          <input className="admin-input" value={form.whatsapp_number} onChange={set("whatsapp_number")} placeholder="62813…" />
        </Field>
        <Field label="CS name" required error={errors.cs_name}>
          <input className="admin-input" value={form.cs_name} onChange={set("cs_name")} />
        </Field>
        <Field label="PPIU license" required error={errors.ppiu_license}>
          <input className="admin-input" value={form.ppiu_license} onChange={set("ppiu_license")} />
        </Field>
        <Field label="Office address" required error={errors.office_address}>
          <textarea className="admin-textarea" rows={3} value={form.office_address} onChange={set("office_address")} />
        </Field>
        <Field label="Maps embed URL" error={errors.maps_embed_url}>
          <input className="admin-input" value={form.maps_embed_url} onChange={set("maps_embed_url")} placeholder="https://…" />
        </Field>
      </div>
    </div>
  );
}
