"use client";

/**
 * ContactForm — Client Component
 * Data source: user input; submits by opening a pre-filled WhatsApp chat.
 * CMS: contact details come from site settings.
 */

import { FormEvent, useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";

interface ContactFormProps {
  whatsappNumber: string;
}

interface FormState {
  name: string;
  phone: string;
  email: string;
  topic: string;
  message: string;
}

const INITIAL_FORM: FormState = {
  name: "",
  phone: "",
  email: "",
  topic: "",
  message: "",
};

const TOPICS = [
  "Paket Umroh Hemat",
  "Paket Umroh Bintang 4",
  "Tabungan Umroh",
  "Umroh Korporat / Group",
  "Halal Tour",
  "Jadwal Keberangkatan",
  "Lainnya",
];

export function ContactForm({ whatsappNumber }: ContactFormProps) {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const updateField = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) nextErrors.name = "Please enter your full name.";
    if (!form.phone.trim()) nextErrors.phone = "Please enter your WhatsApp number.";
    if (!form.topic) nextErrors.topic = "Please select a topic.";
    if (!form.message.trim()) nextErrors.message = "Please enter your message.";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const text = [
      "Assalamu'alaikum SS Umroh,",
      "",
      `*Nama:* ${form.name.trim()}`,
      `*No. WA:* ${form.phone.trim()}`,
      form.email.trim() ? `*Email:* ${form.email.trim()}` : "",
      `*Topik:* ${form.topic}`,
      "",
      "*Pesan:*",
      form.message.trim(),
    ]
      .filter(Boolean)
      .join("\n");

    window.open(
      `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      <div className="contact-form-row">
        <ContactField
          id="contact-name"
          label="Nama Lengkap"
          required
          value={form.name}
          placeholder="Nama Anda"
          error={errors.name}
          onChange={(value) => updateField("name", value)}
        />
        <ContactField
          id="contact-phone"
          label="Nomor WhatsApp"
          type="tel"
          required
          value={form.phone}
          placeholder="08xx-xxxx-xxxx"
          error={errors.phone}
          onChange={(value) => updateField("phone", value)}
        />
      </div>

      <ContactField
        id="contact-email"
        label="Email"
        type="email"
        value={form.email}
        placeholder="email@anda.com"
        error={errors.email}
        onChange={(value) => updateField("email", value)}
      />

      <div className="contact-field">
        <label htmlFor="contact-topic">
          Topik <span aria-hidden>*</span>
        </label>
        <select
          id="contact-topic"
          value={form.topic}
          onChange={(event) => updateField("topic", event.target.value)}
          aria-invalid={Boolean(errors.topic)}
          aria-describedby={errors.topic ? "contact-topic-error" : undefined}
        >
          <option value="">Pilih topik...</option>
          {TOPICS.map((topic) => (
            <option key={topic} value={topic}>
              {topic}
            </option>
          ))}
        </select>
        {errors.topic && (
          <span id="contact-topic-error" className="contact-field-error">
            {errors.topic}
          </span>
        )}
      </div>

      <div className="contact-field">
        <label htmlFor="contact-message">
          Pesan <span aria-hidden>*</span>
        </label>
        <textarea
          id="contact-message"
          value={form.message}
          placeholder="Ceritakan kebutuhan Anda — kapan ingin berangkat, budget, atau pertanyaan tentang paket..."
          onChange={(event) => updateField("message", event.target.value)}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "contact-message-error" : undefined}
        />
        {errors.message && (
          <span id="contact-message-error" className="contact-field-error">
            {errors.message}
          </span>
        )}
      </div>

      <button type="submit" className="contact-submit">
        <MessageCircle size={18} aria-hidden /> Kirim via WhatsApp
      </button>
      <p className="contact-privacy">
        🔒 Data Anda aman. Kami tidak membagikan informasi Anda kepada pihak ketiga.
      </p>
    </form>
  );
}

interface ContactFieldProps {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  type?: "text" | "tel" | "email";
  required?: boolean;
  error?: string;
  onChange: (value: string) => void;
}

function ContactField({
  id,
  label,
  value,
  placeholder,
  type = "text",
  required = false,
  error,
  onChange,
}: ContactFieldProps) {
  return (
    <div className="contact-field">
      <label htmlFor={id}>
        {label} {required && <span aria-hidden>*</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && (
        <span id={`${id}-error`} className="contact-field-error">
          {error}
        </span>
      )}
    </div>
  );
}

export function OfficeOpenStatus() {
  const [status, setStatus] = useState("Memeriksa jam operasional...");

  useEffect(() => {
    const now = new Date();
    const wib = new Date(
      now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" })
    );
    const day = wib.getDay();
    const minutes = wib.getHours() * 60 + wib.getMinutes();
    const open =
      (day >= 1 && day <= 5 && minutes >= 480 && minutes < 1020) ||
      (day === 6 && minutes >= 480 && minutes < 780);

    setStatus(open ? "🟢 Sekarang Buka" : "🔴 Sekarang Tutup");
  }, []);

  return <span className="contact-open-status">{status}</span>;
}
