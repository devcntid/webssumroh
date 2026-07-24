import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Building2,
  Clock3,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";
import { FAQList } from "@/components/Home/FAQList";
import { ScrollReveal } from "@/components/Home/ScrollReveal";
import {
  ContactForm,
  OfficeOpenStatus,
} from "@/components/public/sections/ContactForm";
import { getSiteSettings } from "@/lib/queries/site-settings";
import {
  heroBackgroundStyle,
  heroSectionStyle,
  resolveHeroAppearance,
} from "@/lib/hero-settings";

export const metadata: Metadata = {
  title: "Kontak & Lokasi | SS Umroh",
  description:
    "Hubungi SS Umroh untuk konsultasi gratis paket umroh dan perjalanan korporat. WhatsApp, telepon, atau kunjungi kantor kami di Bandung.",
};

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1534536281715-e28d76689b4d?auto=format&fit=crop&w=1920&q=85";
const OFFICE_IMAGE =
  "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1400&q=80";
const CS_IMAGE =
  "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=800&q=80";

const CONTACT_FAQS = [
  {
    id: 1,
    question: "Bagaimana cara tercepat menghubungi SS Umroh?",
    answer:
      "Via WhatsApp ke 0813-1201-7883. Customer service kami siap membalas selama jam kerja: Senin–Jumat 08.00–17.00 dan Sabtu 08.00–13.00 WIB.",
  },
  {
    id: 2,
    question: "Apakah bisa konsultasi tanpa datang ke kantor?",
    answer:
      "Ya. Hampir semua konsultasi dapat dilakukan melalui WhatsApp atau telepon. Kunjungan kantor biasanya diperlukan untuk penandatanganan dokumen tertentu.",
  },
  {
    id: 3,
    question: "Jam berapa kantor SS Umroh buka?",
    answer:
      "Senin–Jumat pukul 08.00–17.00 WIB dan Sabtu pukul 08.00–13.00 WIB. Hari Minggu dan libur nasional tutup.",
  },
  {
    id: 4,
    question: "Di mana kantor SS Umroh?",
    answer:
      "Kantor kami berada di Jl. Cihapit No. 41, Kota Bandung, Jawa Barat. Hubungi kami melalui WhatsApp sebelum berkunjung untuk konfirmasi jadwal.",
  },
  {
    id: 5,
    question: "Apakah ada biaya untuk konsultasi?",
    answer:
      "Tidak. Konsultasi dengan tim SS Umroh sepenuhnya gratis dan tanpa kewajiban untuk membeli paket.",
  },
  {
    id: 6,
    question: "Apakah SS Umroh melayani jamaah di luar Bandung?",
    answer:
      "Ya. Jamaah kami berasal dari seluruh Indonesia dan sebagian besar proses konsultasi serta administrasi dapat dilakukan secara online.",
  },
  {
    id: 7,
    question: "Berapa lama respons customer service?",
    answer:
      "Pesan WhatsApp biasanya direspons dengan cepat pada jam kerja. Pesan yang masuk di luar jam operasional akan dibalas saat kantor kembali buka.",
  },
];

export default async function ContactPage() {
  let settings: Awaited<ReturnType<typeof getSiteSettings>> = null;

  try {
    settings = await getSiteSettings();
  } catch {
    // Keep essential contact information available if the database is offline.
  }

  const phoneDisplay = settings?.phone_display || "0813-1201-7883";
  const whatsappNumber = settings?.whatsapp_number || "6281312017883";
  const hero = resolveHeroAppearance(settings, "kontak", HERO_IMAGE);
  const officeAddress =
    settings?.office_address || "Jl. Cihapit No. 41, Kota Bandung";
  const csName = settings?.cs_name || "Bayu Muharram";
  const ppiuLicense = settings?.ppiu_license || "SK PPIU No.U.108/2021";
  const whatsappUrl = (message?: string) =>
    `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
      message ??
        "Assalamu'alaikum SS Umroh, saya ingin konsultasi paket perjalanan."
    )}`;
  const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(
    officeAddress
  )}`;
  const wazeUrl = `https://waze.com/ul?q=${encodeURIComponent(officeAddress)}`;

  const contactMethods = [
    {
      href: whatsappUrl(),
      icon: <MessageCircle size={24} aria-hidden />,
      title: "WhatsApp",
      value: phoneDisplay,
      description: `CS ${csName} · Respons tercepat`,
      primary: true,
      external: true,
    },
    {
      href: `tel:+${whatsappNumber}`,
      icon: <Phone size={24} aria-hidden />,
      title: "Telepon",
      value: phoneDisplay,
      description: "Senin–Jumat 08.00–17.00 · Sabtu 08.00–13.00",
      primary: false,
      external: false,
    },
    {
      href: mapsUrl,
      icon: <MapPin size={24} aria-hidden />,
      title: "Kunjungi Kantor",
      value: officeAddress,
      description: "Kota Bandung, Jawa Barat",
      primary: false,
      external: true,
    },
  ];

  return (
    <>
      <ScrollReveal />

      <section
        className="page-hero contact-page-hero"
        aria-label="Kontak SS Umroh"
        style={heroSectionStyle(hero)}
      >
        <div className="ph-bg" style={heroBackgroundStyle(hero)} />
        <div className="ph-pattern" />
        <div className="ph-glow" />
        <div className="container">
          <div className="ph-content">
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <Link href="/" className="breadcrumb-link">
                Beranda
              </Link>
              <span className="breadcrumb-sep">›</span>
              <span className="breadcrumb-cur">Kontak</span>
            </nav>
            <h1 className="ph-h1">
              Kami di Sini untuk Anda —
              <br />
              <em>Konsultasi Gratis,</em> Tanpa Tekanan
            </h1>
            <p className="ph-sub">
              Hubungi tim SS Umroh kapan saja. Kami mendengarkan, menjawab, dan
              membantu Anda memilih perjalanan yang paling sesuai.
            </p>
            <div className="ph-badges" role="list">
              <span className="badge-hero ok" role="listitem">
                ✓ Respons Cepat via WhatsApp
              </span>
              <span className="badge-hero" role="listitem">
                <Phone size={14} aria-hidden /> {phoneDisplay}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="contact-methods" aria-label="Cara menghubungi kami">
        <div className="container contact-method-grid">
          {contactMethods.map((method) => (
            <a
              key={method.title}
              href={method.href}
              target={method.external ? "_blank" : undefined}
              rel={method.external ? "noreferrer" : undefined}
              className={`contact-method-card${
                method.primary ? " contact-method-card--primary" : ""
              }`}
            >
              <span className="contact-method-icon">{method.icon}</span>
              <span>
                <strong>{method.title}</strong>
                <b>{method.value}</b>
                <small>{method.description}</small>
              </span>
            </a>
          ))}
        </div>
      </section>

      <section
        className="home-section contact-main-section"
        aria-label="Formulir dan informasi kontak"
      >
        <div className="container contact-main-grid">
          <div className="contact-form-card">
            <span className="section-label">Konsultasi Gratis</span>
            <h2>Kirim Pesan kepada Kami</h2>
            <p>
              Formulir ini akan membuka WhatsApp dengan pesan terisi otomatis
              agar tim kami dapat merespons lebih cepat.
            </p>
            <ContactForm whatsappNumber={whatsappNumber} />
          </div>

          <div className="contact-info-column">
            <article className="contact-info-card">
              <header>
                <span className="contact-info-icon">
                  <Building2 size={21} aria-hidden />
                </span>
                <h3>Informasi Kantor</h3>
              </header>
              <dl className="contact-detail-list">
                <div>
                  <dt>Nama</dt>
                  <dd>PT. Sarana Sadaya (SS Umroh)</dd>
                </div>
                <div>
                  <dt>Alamat</dt>
                  <dd>{officeAddress}</dd>
                </div>
                <div>
                  <dt>Telepon</dt>
                  <dd>{phoneDisplay}</dd>
                </div>
                <div>
                  <dt>Customer Service</dt>
                  <dd>{csName}</dd>
                </div>
                <div>
                  <dt>Izin</dt>
                  <dd>{ppiuLicense}</dd>
                </div>
              </dl>
            </article>

            <article className="contact-info-card">
              <header>
                <span className="contact-info-icon">
                  <Clock3 size={21} aria-hidden />
                </span>
                <span>
                  <h3>Jam Operasional</h3>
                  <OfficeOpenStatus />
                </span>
              </header>
              <dl className="contact-detail-list contact-hours">
                <div>
                  <dt>Senin–Jumat</dt>
                  <dd>08.00–17.00 WIB</dd>
                </div>
                <div>
                  <dt>Sabtu</dt>
                  <dd>08.00–13.00 WIB</dd>
                </div>
                <div>
                  <dt>Minggu</dt>
                  <dd className="contact-closed">Tutup</dd>
                </div>
              </dl>
              <p className="contact-hours-note">
                💬 <strong>Di luar jam kantor?</strong> Kirim pesan WhatsApp —
                kami balas saat jam operasional dimulai.
              </p>
            </article>

            <article className="contact-cs-card">
              <div className="contact-cs-image">
                <Image
                  src={CS_IMAGE}
                  alt={`Tim customer service SS Umroh siap membantu, ${csName}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 45vw"
                />
              </div>
              <div className="contact-cs-copy">
                <span className="section-label">Customer Service</span>
                <h3>{csName}</h3>
                <p>Siap membantu dengan sabar, jelas, dan profesional.</p>
                <a
                  href={whatsappUrl(
                    `Assalamu'alaikum ${csName}, saya ingin konsultasi paket umroh.`
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="contact-wa-button"
                >
                  <MessageCircle size={17} aria-hidden /> Chat Langsung
                </a>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="home-section contact-location-section" aria-label="Lokasi kantor">
        <div className="container">
          <div className="section-header center">
            <span className="section-label">Lokasi Kantor</span>
            <h2 className="section-title">Temukan Kami di Bandung</h2>
            <p className="section-sub">
              Buat janji terlebih dahulu agar tim kami dapat menyiapkan waktu
              konsultasi khusus untuk Anda.
            </p>
          </div>
          <div className="contact-location-card">
            <div className="contact-location-image">
              <Image
                src={OFFICE_IMAGE}
                alt="Ilustrasi ruang konsultasi kantor SS Umroh"
                fill
                sizes="(max-width: 900px) 100vw, 50vw"
              />
            </div>
            <div className="contact-location-copy">
              <span className="contact-location-pin">
                <MapPin size={28} aria-hidden />
              </span>
              <h3>Kantor SS Umroh</h3>
              <p>{officeAddress}, Jawa Barat</p>
              <div className="contact-location-actions">
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary"
                >
                  <MapPin size={17} aria-hidden /> Buka Google Maps
                </a>
                <a
                  href={wazeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="contact-map-secondary"
                >
                  Buka Waze
                </a>
              </div>
              <a
                href={whatsappUrl(
                  "Assalamu'alaikum SS Umroh, saya ingin membuat janji kunjungan ke kantor."
                )}
                target="_blank"
                rel="noreferrer"
                className="contact-visit-link"
              >
                <MessageCircle size={16} aria-hidden /> Buat Janji Kunjungan
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="contact-whatsapp-section" aria-label="Chat WhatsApp">
        <div className="container contact-whatsapp-grid">
          <div>
            <span className="section-label section-label--gold">
              Respons Tercepat
            </span>
            <h2>Langsung Chat dengan Tim SS Umroh</h2>
            <p>
              WhatsApp adalah cara kami melayani paling cepat. Tim kami siap
              menjawab pertanyaan Anda dengan sabar dan jelas.
            </p>
            <div className="contact-whatsapp-badges">
              <span>✓ Konsultasi gratis</span>
              <span>✓ Tanpa tekanan</span>
              <span>✓ Jawaban jelas</span>
            </div>
          </div>
          <div className="contact-whatsapp-actions">
            <a
              href={whatsappUrl()}
              target="_blank"
              rel="noreferrer"
              className="contact-whatsapp-primary"
            >
              <span className="contact-whatsapp-icon">
                <MessageCircle size={24} aria-hidden />
              </span>
              <span>
                <small>Chat WhatsApp Sekarang</small>
                <strong>{phoneDisplay}</strong>
              </span>
            </a>
            <a href={`tel:+${whatsappNumber}`} className="contact-whatsapp-row">
              <Phone size={18} aria-hidden /> {phoneDisplay}
            </a>
            <div className="contact-whatsapp-row">
              <MapPin size={18} aria-hidden /> {officeAddress}
            </div>
          </div>
        </div>
      </section>

      <section className="faq-section home-section" aria-label="FAQ kontak">
        <div className="container faq-inner">
          <div className="faq-side">
            <span className="section-label">FAQ Kontak</span>
            <h2 className="section-title">Pertanyaan Sebelum Menghubungi</h2>
            <p className="section-sub">
              Informasi penting sebelum berkonsultasi atau berkunjung ke kantor
              kami.
            </p>
            <div className="faq-cta-box">
              <h3>Langsung Konsultasi?</h3>
              <p>
                Tidak perlu mengisi formulir — langsung chat WhatsApp dengan
                customer service kami. Gratis, tanpa komitmen.
              </p>
              <a
                href={whatsappUrl()}
                target="_blank"
                rel="noreferrer"
                className="btn-faq"
              >
                <MessageCircle size={15} aria-hidden /> Chat WhatsApp
              </a>
            </div>
          </div>
          <div className="faq-content">
            <FAQList faqs={CONTACT_FAQS} />
          </div>
        </div>
      </section>

      <section className="cta-banner" aria-label="Mulai konsultasi SS Umroh">
        <div className="cta-glow" />
        <div className="container cta-inner">
          <span className="section-label">Mulai Hari Ini</span>
          <h2 className="section-title">
            Satu Pesan — Perjalanan Ibadah Dimulai
          </h2>
          <p className="section-sub">
            1.000+ jamaah per tahun dan 0 gagal berangkat sejak 2012. Hubungi
            kami hari ini.
          </p>
          <div className="cta-btns">
            <a
              href={whatsappUrl()}
              target="_blank"
              rel="noreferrer"
              className="btn-primary"
            >
              <MessageCircle size={18} aria-hidden /> Chat WhatsApp Sekarang
            </a>
            <Link href="/paket-umroh" className="btn-outline">
              Lihat Paket Umroh →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
