"use client";

import { useCallback, useEffect, useState } from "react";
import { Image as ImageIcon, RotateCcw, Save, Upload } from "lucide-react";
import { HexColorInput, HexColorPicker } from "react-colorful";
import { Field } from "@/components/admin/ui/Field";
import { Btn } from "@/components/admin/ui/Btn";
import { useToast } from "@/components/admin/ui/Toast";
import { fetchJson, issuesToFieldErrors } from "@/components/admin/lib/fetch-json";
import {
  DEFAULT_HERO_COLOR,
  HERO_PAGES,
  normalizeHeroSettings,
} from "@/lib/hero-settings";
import type { HeroAppearance, HeroPageKey, SiteSetting } from "@/types/db";

type Form = {
  phone_display: string;
  whatsapp_number: string;
  office_address: string;
  cs_name: string;
  ppiu_license: string;
  maps_embed_url: string;
  hero_settings: Record<HeroPageKey, HeroAppearance>;
};

const EMPTY: Form = {
  phone_display: "",
  whatsapp_number: "",
  office_address: "",
  cs_name: "",
  ppiu_license: "",
  maps_embed_url: "",
  hero_settings: normalizeHeroSettings(),
};

export function SettingsClient() {
  const { showToast } = useToast();
  const [form, setForm] = useState<Form>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPage, setUploadingPage] = useState<HeroPageKey | null>(null);
  const [activeColorPicker, setActiveColorPicker] = useState<HeroPageKey | null>(null);

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
      hero_settings: normalizeHeroSettings(d.hero_settings),
    });
    setLoading(false);
  }, [showToast]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
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

  function setHero(page: HeroPageKey, patch: Partial<HeroAppearance>) {
    setForm((current) => ({
      ...current,
      hero_settings: {
        ...current.hero_settings,
        [page]: { ...current.hero_settings[page], ...patch },
      },
    }));
  }

  async function uploadHero(page: HeroPageKey, file?: File) {
    if (!file) return;
    setUploadingPage(page);
    const body = new FormData();
    body.append("file", file);
    body.append("folder", `heroes/${page}`);
    const response = await fetch("/api/upload", { method: "POST", body });
    const json = await response.json().catch(() => ({}));
    setUploadingPage(null);
    if (!response.ok || !json.data?.url) {
      showToast(json.error || "Failed to upload hero image", "error");
      return;
    }
    setHero(page, { image_url: json.data.url });
    showToast("Hero image uploaded. Save settings to publish it.");
  }

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

      <div className="admin-card" style={{ maxWidth: 760, marginBottom: 20 }}>
        <h3 style={{ margin: "0 0 18px", fontSize: 15 }}>Contact and company details</h3>
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

      <div className="admin-card">
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ margin: "0 0 5px", fontSize: 15 }}>Page hero appearance</h3>
          <p style={{ margin: 0, fontSize: 12, color: "var(--text-secondary)" }}>
            Upload a background image and choose the overlay color for each public page.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 16,
          }}
        >
          {HERO_PAGES.map((page) => {
            const hero = form.hero_settings[page.key];
            const uploading = uploadingPage === page.key;
            return (
              <section
                key={page.key}
                style={{
                  border: "1px solid var(--border)",
                  borderRadius: 14,
                  overflow: "hidden",
                  background: "#fff",
                }}
                aria-label={`Hero ${page.label}`}
              >
                <div
                  style={{
                    height: 150,
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    backgroundColor: hero.background_color,
                    backgroundImage: hero.image_url
                      ? `linear-gradient(${hero.background_color}CC, ${hero.background_color}CC), url(${hero.image_url})`
                      : undefined,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  {!hero.image_url && <ImageIcon size={30} opacity={0.7} aria-hidden />}
                  <strong
                    style={{
                      position: "absolute",
                      left: 14,
                      bottom: 12,
                      fontSize: 13,
                      textShadow: "0 1px 4px rgba(0,0,0,.5)",
                    }}
                  >
                    {page.label} · {page.route}
                  </strong>
                </div>

                <div style={{ padding: 14 }}>
                  <Field label="Background image URL" error={errors[`hero_settings.${page.key}.image_url`]}>
                    <input
                      className="admin-input"
                      type="url"
                      value={hero.image_url ?? ""}
                      onChange={(event) =>
                        setHero(page.key, { image_url: event.target.value.trim() || null })
                      }
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
                          void uploadHero(page.key, event.target.files?.[0]);
                          event.currentTarget.value = "";
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      className="admin-btn secondary"
                      title="Use default page image"
                      onClick={() => setHero(page.key, { image_url: null })}
                    >
                      <RotateCcw size={13} />
                      Default
                    </button>
                  </div>

                  <Field
                    label="Background color (HEX)"
                    error={errors[`hero_settings.${page.key}.background_color`]}
                  >
                    <div className="admin-hex-color-field">
                      <button
                        type="button"
                        className="admin-hex-color-swatch"
                        aria-label={`Background color for ${page.label}`}
                        aria-expanded={activeColorPicker === page.key}
                        onClick={() =>
                          setActiveColorPicker((current) =>
                            current === page.key ? null : page.key
                          )
                        }
                      >
                        <span style={{ backgroundColor: hero.background_color }} />
                      </button>
                      <div className="admin-hex-color-input-wrap">
                        <span>#</span>
                        <HexColorInput
                          className="admin-input admin-hex-color-input"
                          color={hero.background_color}
                          onChange={(color) =>
                            setHero(page.key, {
                              background_color: `#${color.replace(/^#/, "").toUpperCase()}`,
                            })
                          }
                          prefixed={false}
                          alpha={false}
                          placeholder={DEFAULT_HERO_COLOR.slice(1)}
                          aria-label={`HEX color value for ${page.label}`}
                        />
                      </div>
                      {activeColorPicker === page.key && (
                        <div className="admin-hex-color-popover">
                          <HexColorPicker
                            color={hero.background_color}
                            onChange={(color) =>
                              setHero(page.key, { background_color: color.toUpperCase() })
                            }
                          />
                          <div className="admin-hex-color-value">
                            {hero.background_color.toUpperCase()}
                          </div>
                        </div>
                      )}
                    </div>
                  </Field>
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
