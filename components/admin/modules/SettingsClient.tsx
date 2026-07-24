"use client";

import { useCallback, useEffect, useState } from "react";
import { Image as ImageIcon, Plus, RotateCcw, Save, Trash2, Upload, Video } from "lucide-react";
import { HexColorInput, HexColorPicker } from "react-colorful";
import { Field } from "@/components/admin/ui/Field";
import { Btn } from "@/components/admin/ui/Btn";
import { useToast } from "@/components/admin/ui/Toast";
import { fetchJson, issuesToFieldErrors } from "@/components/admin/lib/fetch-json";
import { DEFAULT_LOGO_COLOR_URL, DEFAULT_LOGO_WHITE_URL } from "@/lib/brand";
import {
  DEFAULT_HERO_COLOR,
  DEFAULT_HOME_SLIDES,
  HERO_PAGES,
  normalizeHeroSettings,
  normalizeHomeSlides,
} from "@/lib/hero-settings";
import type { HeroAppearance, HeroMediaType, HeroPageKey, HeroSlide, SiteSetting } from "@/types/db";

type Form = {
  phone_display: string;
  whatsapp_number: string;
  office_address: string;
  cs_name: string;
  ppiu_license: string;
  maps_embed_url: string;
  logo_url: string;
  logo_white_url: string;
  hero_settings: Record<HeroPageKey, HeroAppearance>;
};

const EMPTY: Form = {
  phone_display: "",
  whatsapp_number: "",
  office_address: "",
  cs_name: "",
  ppiu_license: "",
  maps_embed_url: "",
  logo_url: "",
  logo_white_url: "",
  hero_settings: normalizeHeroSettings(),
};

const MEDIA_OPTIONS: { value: HeroMediaType; label: string }[] = [
  { value: "image", label: "Image" },
  { value: "youtube", label: "YouTube" },
  { value: "video", label: "Video file" },
];

export function SettingsClient() {
  const { showToast } = useToast();
  const [form, setForm] = useState<Form>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPage, setUploadingPage] = useState<HeroPageKey | null>(null);
  const [uploadingVideoPage, setUploadingVideoPage] = useState<HeroPageKey | null>(null);
  const [uploadingSlideIndex, setUploadingSlideIndex] = useState<number | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState<"color" | "white" | null>(null);
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
      logo_url: d.logo_url ?? "",
      logo_white_url: d.logo_white_url ?? "",
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
      logo_url: form.logo_url.trim() || null,
      logo_white_url: form.logo_white_url.trim() || null,
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

  function setHomeSlides(next: HeroSlide[]) {
    setHero("home", { slides: normalizeHomeSlides(next) });
  }

  function patchHomeSlide(index: number, patch: Partial<HeroSlide>) {
    const slides = [...(form.hero_settings.home.slides ?? DEFAULT_HOME_SLIDES)];
    slides[index] = { ...slides[index], ...patch };
    setHomeSlides(slides);
  }

  function addHomeSlide() {
    const slides = [...(form.hero_settings.home.slides ?? DEFAULT_HOME_SLIDES)];
    if (slides.length >= 3) return;
    slides.push({
      title: `Judul slide ${slides.length + 1}`,
      description: "Tulis deskripsi singkat untuk slide hero ini.",
      image_url: DEFAULT_HOME_SLIDES[0].image_url,
    });
    setHomeSlides(slides);
  }

  function removeHomeSlide(index: number) {
    const slides = [...(form.hero_settings.home.slides ?? DEFAULT_HOME_SLIDES)];
    if (slides.length <= 1) return;
    slides.splice(index, 1);
    setHomeSlides(slides);
  }

  async function uploadHomeSlideImage(index: number, file?: File) {
    if (!file) return;
    setUploadingSlideIndex(index);
    const body = new FormData();
    body.append("file", file);
    body.append("folder", `heroes/home/slides`);
    const response = await fetch("/api/upload", { method: "POST", body });
    const json = await response.json().catch(() => ({}));
    setUploadingSlideIndex(null);
    if (!response.ok || !json.data?.url) {
      showToast(json.error || "Failed to upload slide image", "error");
      return;
    }
    patchHomeSlide(index, { image_url: json.data.url as string });
    showToast("Slide image uploaded. Save settings to publish it.");
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

  async function uploadLogo(variant: "color" | "white", file?: File) {
    if (!file) return;
    setUploadingLogo(variant);
    const body = new FormData();
    body.append("file", file);
    body.append("folder", variant === "white" ? "brand/white" : "brand/color");
    const response = await fetch("/api/upload", { method: "POST", body });
    const json = await response.json().catch(() => ({}));
    setUploadingLogo(null);
    if (!response.ok || !json.data?.url) {
      showToast(json.error || "Failed to upload logo", "error");
      return;
    }
    const field = variant === "white" ? "logo_white_url" : "logo_url";
    setForm((current) => ({ ...current, [field]: json.data.url as string }));
    showToast(
      variant === "white"
        ? "White logo uploaded. Save settings to publish it."
        : "Color logo uploaded. Save settings to publish it."
    );
  }

  async function uploadHeroVideo(page: HeroPageKey, file?: File) {
    if (!file) return;
    setUploadingVideoPage(page);
    const body = new FormData();
    body.append("file", file);
    body.append("folder", `heroes/${page}/videos`);
    const response = await fetch("/api/upload", { method: "POST", body });
    const json = await response.json().catch(() => ({}));
    setUploadingVideoPage(null);
    if (!response.ok || !json.data?.url) {
      showToast(json.error || "Failed to upload hero video", "error");
      return;
    }
    setHero(page, { media_type: "video", video_url: json.data.url });
    showToast("Hero video uploaded. Save settings to publish it.");
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

      <div className="admin-card" style={{ maxWidth: 760, marginBottom: 20 }}>
        <h3 style={{ margin: "0 0 8px", fontSize: 15 }}>Site logos</h3>
        <p style={{ margin: "0 0 16px", fontSize: 12, color: "var(--text-secondary)" }}>
          Upload two versions: a white logo for the transparent header (before scroll),
          and a color logo for the white scrolled header and footer.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 16,
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 88,
                marginBottom: 12,
                borderRadius: 12,
                background: "linear-gradient(135deg, #1a0533, #2d0a5c)",
                border: "1px solid var(--border)",
                padding: 16,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={form.logo_white_url.trim() || DEFAULT_LOGO_WHITE_URL}
                alt="White logo preview"
                style={{ maxHeight: 44, maxWidth: "100%", objectFit: "contain" }}
              />
            </div>
            <Field label="White logo (header before scroll)" error={errors.logo_white_url}>
              <input
                className="admin-input"
                type="url"
                value={form.logo_white_url}
                onChange={set("logo_white_url")}
                placeholder="https://… or upload below"
              />
            </Field>
            <div style={{ display: "flex", gap: 8 }}>
              <label className="admin-btn secondary" style={{ cursor: "pointer", flex: 1 }}>
                <Upload size={13} />
                {uploadingLogo === "white" ? "Uploading…" : "Upload white"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  hidden
                  disabled={uploadingLogo != null}
                  onChange={(event) => {
                    void uploadLogo("white", event.target.files?.[0]);
                    event.currentTarget.value = "";
                  }}
                />
              </label>
              <button
                type="button"
                className="admin-btn secondary"
                title="Restore default white logo"
                onClick={() => setForm((p) => ({ ...p, logo_white_url: "" }))}
              >
                <RotateCcw size={13} />
                Default
              </button>
            </div>
          </div>

          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 88,
                marginBottom: 12,
                borderRadius: 12,
                background: "#f8f7fa",
                border: "1px solid var(--border)",
                padding: 16,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={form.logo_url.trim() || DEFAULT_LOGO_COLOR_URL}
                alt="Color logo preview"
                style={{ maxHeight: 44, maxWidth: "100%", objectFit: "contain" }}
              />
            </div>
            <Field label="Color logo (scrolled header + footer)" error={errors.logo_url}>
              <input
                className="admin-input"
                type="url"
                value={form.logo_url}
                onChange={set("logo_url")}
                placeholder="https://… or upload below"
              />
            </Field>
            <div style={{ display: "flex", gap: 8 }}>
              <label className="admin-btn secondary" style={{ cursor: "pointer", flex: 1 }}>
                <Upload size={13} />
                {uploadingLogo === "color" ? "Uploading…" : "Upload color"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  hidden
                  disabled={uploadingLogo != null}
                  onChange={(event) => {
                    void uploadLogo("color", event.target.files?.[0]);
                    event.currentTarget.value = "";
                  }}
                />
              </label>
              <button
                type="button"
                className="admin-btn secondary"
                title="Restore default color logo"
                onClick={() => setForm((p) => ({ ...p, logo_url: "" }))}
              >
                <RotateCcw size={13} />
                Default
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-card">
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ margin: "0 0 5px", fontSize: 15 }}>Page hero appearance</h3>
          <p style={{ margin: 0, fontSize: 12, color: "var(--text-secondary)" }}>
            Upload a background image and choose the overlay color for each public page.
            Home also supports a YouTube or uploaded video background.
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
            const uploadingVideo = uploadingVideoPage === page.key;
            const mediaType = hero.media_type ?? "image";
            const supportsVideo = Boolean(page.supportsVideo);

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
                  {!hero.image_url && mediaType === "image" && (
                    <ImageIcon size={30} opacity={0.7} aria-hidden />
                  )}
                  {mediaType !== "image" && (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: 12,
                        fontWeight: 600,
                        background: "rgba(0,0,0,.45)",
                        borderRadius: 999,
                        padding: "6px 12px",
                      }}
                    >
                      <Video size={14} aria-hidden />
                      {mediaType === "youtube" ? "YouTube" : "Video file"}
                    </span>
                  )}
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
                  {supportsVideo && (
                    <Field
                      label="Background media"
                      error={errors[`hero_settings.${page.key}.media_type`]}
                    >
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 4 }}>
                        {MEDIA_OPTIONS.map((option) => {
                          const active = mediaType === option.value;
                          return (
                            <button
                              key={option.value}
                              type="button"
                              className="admin-btn secondary"
                              aria-pressed={active}
                              onClick={() =>
                                setHero(page.key, {
                                  media_type: option.value,
                                  video_url:
                                    option.value === "image"
                                      ? null
                                      : hero.video_url ?? null,
                                })
                              }
                              style={{
                                flex: "1 1 auto",
                                borderColor: active ? "var(--p6, #6B21A8)" : undefined,
                                background: active ? "rgba(107,33,168,.08)" : undefined,
                              }}
                            >
                              {option.label}
                            </button>
                          );
                        })}
                      </div>
                    </Field>
                  )}

                  {supportsVideo && mediaType === "youtube" && (
                    <Field
                      label="YouTube URL or video ID"
                      error={errors[`hero_settings.${page.key}.video_url`]}
                    >
                      <input
                        className="admin-input"
                        value={hero.video_url ?? ""}
                        onChange={(event) =>
                          setHero(page.key, {
                            media_type: "youtube",
                            video_url: event.target.value.trim() || null,
                          })
                        }
                        placeholder="https://www.youtube.com/watch?v=… or video ID"
                      />
                    </Field>
                  )}

                  {supportsVideo && mediaType === "video" && (
                    <>
                      <Field
                        label="Video file URL"
                        error={errors[`hero_settings.${page.key}.video_url`]}
                      >
                        <input
                          className="admin-input"
                          type="url"
                          value={hero.video_url ?? ""}
                          onChange={(event) =>
                            setHero(page.key, {
                              media_type: "video",
                              video_url: event.target.value.trim() || null,
                            })
                          }
                          placeholder="https://….mp4"
                        />
                      </Field>
                      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                        <label className="admin-btn secondary" style={{ cursor: "pointer", flex: 1 }}>
                          <Upload size={13} />
                          {uploadingVideo ? "Uploading…" : "Upload video"}
                          <input
                            type="file"
                            accept="video/mp4,video/webm,video/quicktime"
                            hidden
                            disabled={uploadingVideo}
                            onChange={(event) => {
                              void uploadHeroVideo(page.key, event.target.files?.[0]);
                              event.currentTarget.value = "";
                            }}
                          />
                        </label>
                        <button
                          type="button"
                          className="admin-btn secondary"
                          title="Clear video URL"
                          onClick={() => setHero(page.key, { video_url: null })}
                        >
                          <RotateCcw size={13} />
                          Clear
                        </button>
                      </div>
                      <p style={{ margin: "0 0 14px", fontSize: 11, color: "var(--text-secondary)" }}>
                        MP4 or WebM, max 80MB. Image below is used as poster/fallback.
                      </p>
                    </>
                  )}

                  <Field
                    label={
                      supportsVideo && mediaType !== "image"
                        ? "Poster / fallback image URL"
                        : "Background image URL"
                    }
                    error={errors[`hero_settings.${page.key}.image_url`]}
                  >
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

      <div className="admin-card" style={{ marginTop: 20 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            alignItems: "flex-start",
            marginBottom: 18,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h3 style={{ margin: "0 0 5px", fontSize: 15 }}>Home hero content slides</h3>
            <p style={{ margin: 0, fontSize: 12, color: "var(--text-secondary)" }}>
              Edit 1–3 slides (title, description, right-side image). Use *text* in the title for
              gold emphasis. Slides auto-rotate with fade/slide on the homepage.
            </p>
          </div>
          <Btn
            variant="secondary"
            icon={Plus}
            onClick={addHomeSlide}
            disabled={(form.hero_settings.home.slides?.length ?? 0) >= 3}
          >
            Add slide
          </Btn>
        </div>

        <div style={{ display: "grid", gap: 16 }}>
          {(form.hero_settings.home.slides ?? DEFAULT_HOME_SLIDES).map((slide, index) => {
            const uploadingSlide = uploadingSlideIndex === index;
            return (
              <section
                key={`home-slide-${index}`}
                style={{
                  border: "1px solid var(--border)",
                  borderRadius: 14,
                  padding: 16,
                  background: "#fff",
                }}
                aria-label={`Home hero slide ${index + 1}`}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 12,
                    gap: 8,
                  }}
                >
                  <strong style={{ fontSize: 13 }}>Slide {index + 1}</strong>
                  <button
                    type="button"
                    className="admin-btn secondary"
                    disabled={(form.hero_settings.home.slides?.length ?? 0) <= 1}
                    onClick={() => removeHomeSlide(index)}
                    title="Remove slide"
                  >
                    <Trash2 size={13} />
                    Remove
                  </button>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "minmax(0,1fr) 160px",
                    gap: 16,
                  }}
                >
                  <div>
                    <Field
                      label="Title"
                      required
                      error={errors[`hero_settings.home.slides.${index}.title`]}
                    >
                      <input
                        className="admin-input"
                        value={slide.title}
                        onChange={(event) =>
                          patchHomeSlide(index, { title: event.target.value })
                        }
                        placeholder="Wujudkan Umroh yang *Khusyuk*…"
                      />
                    </Field>
                    <Field
                      label="Description"
                      required
                      error={errors[`hero_settings.home.slides.${index}.description`]}
                    >
                      <textarea
                        className="admin-input"
                        rows={4}
                        value={slide.description}
                        onChange={(event) =>
                          patchHomeSlide(index, { description: event.target.value })
                        }
                        placeholder="Short supporting paragraph…"
                      />
                    </Field>
                    <Field
                      label="Side image URL"
                      error={errors[`hero_settings.home.slides.${index}.image_url`]}
                    >
                      <input
                        className="admin-input"
                        type="url"
                        value={slide.image_url ?? ""}
                        onChange={(event) =>
                          patchHomeSlide(index, {
                            image_url: event.target.value.trim() || null,
                          })
                        }
                        placeholder="https://…"
                      />
                    </Field>
                    <div style={{ display: "flex", gap: 8 }}>
                      <label
                        className="admin-btn secondary"
                        style={{ cursor: "pointer", flex: 1 }}
                      >
                        <Upload size={13} />
                        {uploadingSlide ? "Uploading…" : "Upload image"}
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          hidden
                          disabled={uploadingSlide}
                          onChange={(event) => {
                            void uploadHomeSlideImage(index, event.target.files?.[0]);
                            event.currentTarget.value = "";
                          }}
                        />
                      </label>
                      <button
                        type="button"
                        className="admin-btn secondary"
                        onClick={() =>
                          patchHomeSlide(index, {
                            image_url: DEFAULT_HOME_SLIDES[0].image_url,
                          })
                        }
                      >
                        <RotateCcw size={13} />
                        Default
                      </button>
                    </div>
                  </div>

                  <div
                    style={{
                      borderRadius: 12,
                      overflow: "hidden",
                      border: "1px solid var(--border)",
                      background: "#f4f4f5",
                      aspectRatio: "4 / 5",
                      position: "relative",
                    }}
                  >
                    {slide.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={slide.image_url}
                        alt=""
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <div
                        style={{
                          display: "grid",
                          placeItems: "center",
                          height: "100%",
                          color: "var(--text-secondary)",
                        }}
                      >
                        <ImageIcon size={28} aria-hidden />
                      </div>
                    )}
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
