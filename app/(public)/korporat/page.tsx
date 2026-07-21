import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ClipboardCheck,
  MessageCircle,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react";
import { FAQList } from "@/components/Home/FAQList";
import { ScrollReveal } from "@/components/Home/ScrollReveal";
import { TestimonialCard } from "@/components/Home/TestimonialCard";
import { getSiteSettings } from "@/lib/queries/site-settings";
import { getPublicTestimonials } from "@/lib/queries/testimonials";
import {
  heroBackgroundStyle,
  heroSectionStyle,
  resolveHeroAppearance,
} from "@/lib/hero-settings";

export const metadata: Metadata = {
  title: "Umroh Korporat & Group | SS Umroh",
  description:
    "Program umroh korporat untuk perusahaan, komunitas, dan organisasi dengan koordinator khusus, jadwal fleksibel, dan laporan formal.",
};

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1920&q=85";
const SERVICE_IMAGE =
  "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1400&q=80";

const SERVICES = [
  {
    icon: "🏢",
    title: "Umroh Karyawan & Insentif",
    description: "Penghargaan bermakna bagi karyawan terbaik dengan koordinasi, dokumentasi, dan laporan lengkap untuk tim HR.",
    tag: "Karyawan · Reward · Insentif",
  },
  {
    icon: "⭐",
    title: "CSR Perusahaan",
    description: "Program tanggung jawab sosial melalui perjalanan ibadah dengan dokumentasi dan laporan formal untuk kebutuhan CSR.",
    tag: "CSR · Laporan Formal",
  },
  {
    icon: "🕌",
    title: "Komunitas & Organisasi",
    description: "Program bagi masjid, pesantren, ormas Islam, arisan, dan alumni dengan jadwal yang menyesuaikan kebutuhan kelompok.",
    tag: "Masjid · Pesantren · Komunitas",
  },
];

const INDUSTRIES = [
  ["🏭", "Manufaktur", "Program insentif karyawan"],
  ["🏦", "Perbankan & Keuangan", "Reward nasabah premier"],
  ["🕌", "Masjid & DKM", "Program jamaah masjid"],
  ["📚", "Pesantren", "Guru dan santri berprestasi"],
  ["👥", "Ormas Islam", "Program anggota organisasi"],
  ["🏛️", "Instansi Pemerintah", "Reward dan apresiasi ASN"],
  ["🏥", "Rumah Sakit", "Reward tenaga kesehatan"],
  ["🤝", "Arisan & Komunitas", "Arisan umroh, alumni, RT/RW"],
];

const PROCESS = [
  ["1", "💬", "Konsultasi Awal", "Sampaikan kebutuhan organisasi melalui WhatsApp."],
  ["2", "📄", "Penawaran Khusus", "Proposal program dan harga khusus group."],
  ["3", "✍️", "Konfirmasi & DP", "Amankan jadwal dengan booking fee."],
  ["4", "🎓", "Manasik Group", "Pembekalan intensif sebelum keberangkatan."],
  ["5", "✈️", "Berangkat", "Didampingi koordinator khusus rombongan."],
];

const CORPORATE_FAQS = [
  {
    id: 1,
    question: "Berapa minimum peserta untuk program umroh korporat?",
    answer: "Program korporat SS Umroh dapat diikuti mulai dari 10 orang. Jumlah maksimal per rombongan disesuaikan agar pelayanan kepada setiap jamaah tetap optimal.",
  },
  {
    id: 2,
    question: "Apakah jadwal keberangkatan dapat disesuaikan?",
    answer: "Ya. Jadwal dapat disesuaikan dengan kalender perusahaan atau agenda komunitas, bergantung pada ketersediaan penerbangan dan akomodasi.",
  },
  {
    id: 3,
    question: "Dokumen apa yang tersedia untuk kebutuhan CSR atau HR?",
    answer: "Kami dapat menyediakan proposal, daftar jamaah, jadwal perjalanan, dokumentasi kegiatan, dan laporan keberangkatan sesuai kebutuhan organisasi.",
  },
  {
    id: 4,
    question: "Apakah tersedia harga khusus untuk group besar?",
    answer: "Ya. Penawaran dibuat berdasarkan jumlah peserta, periode keberangkatan, maskapai, dan pilihan akomodasi. Hubungi tim kami untuk proposal terperinci.",
  },
  {
    id: 5,
    question: "Apakah manasik dilakukan khusus untuk group?",
    answer: "Ya. Manasik dapat diselenggarakan khusus untuk rombongan agar materi, jadwal, dan koordinasi lebih efektif.",
  },
  {
    id: 6,
    question: "Organisasi apa saja yang dapat menggunakan layanan ini?",
    answer: "Perusahaan, komunitas masjid, pesantren, organisasi Islam, arisan, alumni, RT/RW, rumah sakit, dan instansi pemerintah dapat mengajukan program.",
  },
];

export default async function CorporatePage() {
  let testimonials: Awaited<ReturnType<typeof getPublicTestimonials>> = [];
  let settings: Awaited<ReturnType<typeof getSiteSettings>> = null;

  try {
    [testimonials, settings] = await Promise.all([
      getPublicTestimonials("general", 3),
      getSiteSettings(),
    ]);
  } catch {
    // Preserve public corporate information when external services are unavailable.
  }

  const whatsappNumber = settings?.whatsapp_number || "6281312017883";
  const hero = resolveHeroAppearance(settings, "korporat", HERO_IMAGE);
  const waUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    "Assalamu'alaikum SS Umroh, saya ingin konsultasi program umroh korporat dan mendapatkan penawaran group."
  )}`;
  const presentationUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    "Assalamu'alaikum SS Umroh, kami ingin mengundang tim SS Umroh untuk mempresentasikan program umroh korporat."
  )}`;

  return (
    <>
      <ScrollReveal />

      <section
        className="page-hero corporate-page-hero"
        aria-label="Umroh korporat"
        style={heroSectionStyle(hero)}
      >
        <div className="ph-bg" style={heroBackgroundStyle(hero)} />
        <div className="ph-pattern" />
        <div className="ph-glow" />
        <div className="container">
          <div className="ph-content">
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <Link href="/" className="breadcrumb-link">Beranda</Link>
              <span className="breadcrumb-sep">›</span>
              <span className="breadcrumb-cur">Korporat</span>
            </nav>
            <h1 className="ph-h1">
              Umroh Korporat &amp; Group —<br />
              <em>Pengalaman Ibadah</em> untuk Tim Anda
            </h1>
            <p className="ph-sub">
              SS Umroh melayani perusahaan, komunitas, dan organisasi dengan
              koordinator khusus, harga group, serta laporan keberangkatan.
            </p>
            <div className="ph-badges" role="list">
              <span className="badge-hero ok" role="listitem">
                <ShieldCheck size={14} aria-hidden /> Koordinator Dedicated
              </span>
              <span className="badge-hero" role="listitem">
                <Users size={14} aria-hidden /> Min. 10 Orang
              </span>
              <span className="badge-hero" role="listitem">
                <Star size={14} aria-hidden /> Harga Spesial Group
              </span>
              <span className="badge-hero" role="listitem">
                <ClipboardCheck size={14} aria-hidden /> Laporan Formal
              </span>
            </div>
            <div className="ph-ctas">
              <a href={waUrl} target="_blank" rel="noreferrer" className="btn-primary">
                <MessageCircle size={18} aria-hidden /> Ajukan Penawaran Group
              </a>
              <a href="#layanan-korporat" className="btn-outline">Lihat Program ↓</a>
            </div>
          </div>
        </div>
      </section>

      <section id="layanan-korporat" className="home-section corporate-services-section" aria-label="Layanan korporat">
        <div className="container">
          <div className="section-header center">
            <span className="section-label">Layanan Korporat</span>
            <h2 className="section-title">Program untuk Setiap Jenis Organisasi</h2>
            <p className="section-sub">
              Dari perusahaan besar hingga komunitas lokal, program disesuaikan
              dengan kebutuhan dan tujuan organisasi Anda.
            </p>
          </div>

          <div className="corporate-service-grid">
            {SERVICES.map((service) => (
              <article key={service.title} className="k-card">
                <div className="k-icon" aria-hidden>{service.icon}</div>
                <h3 className="k-title">{service.title}</h3>
                <p className="k-body">{service.description}</p>
                <span className="k-tag">{service.tag}</span>
              </article>
            ))}
          </div>

          <div className="corporate-presentation">
            <Image
              src={SERVICE_IMAGE}
              alt="Ilustrasi presentasi dan diskusi program korporat"
              fill
              sizes="(max-width: 1200px) 100vw, 1200px"
            />
            <div className="corporate-presentation-overlay" />
            <div className="corporate-presentation-copy">
              <span className="corporate-illustration-label">Ilustrasi tim profesional</span>
              <h3>Rancang Perjalanan Bersama Kami</h3>
              <p>
                Tim kami siap mempresentasikan program di kantor Anda dan
                menyesuaikan jadwal, fasilitas, serta anggaran secara profesional.
              </p>
              <a href={presentationUrl} target="_blank" rel="noreferrer" className="btn-primary">
                Undang Kami Presentasi →
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="home-section corporate-industries-section" aria-label="Organisasi yang dilayani">
        <div className="container">
          <div className="section-header center">
            <span className="section-label">Siapa yang Kami Layani</span>
            <h2 className="section-title">Melayani Semua Jenis Organisasi</h2>
          </div>
          <div className="corporate-industry-grid">
            {INDUSTRIES.map(([icon, name, description]) => (
              <article key={name} className="corporate-industry-card">
                <span aria-hidden>{icon}</span>
                <h3>{name}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section corporate-process-section" aria-label="Proses program korporat">
        <div className="container">
          <div className="section-header center">
            <span className="section-label">Cara Kerja</span>
            <h2 className="section-title">Proses Mudah, Transparan, Profesional</h2>
          </div>
          <ol className="corporate-process">
            {PROCESS.map(([number, icon, title, description]) => (
              <li key={number}>
                <span className="corporate-process-number">{number}</span>
                <span className="corporate-process-icon" aria-hidden>{icon}</span>
                <h3>{title}</h3>
                <p>{description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="testi-section home-section" aria-label="Testimoni jamaah">
        <div className="container">
          <div className="section-header center">
            <span className="section-label">Kepercayaan Jamaah</span>
            <h2 className="section-title section-title--light">
              Yang Dikatakan Jamaah SS Umroh
            </h2>
          </div>
          <div className="t-grid">
            {testimonials.map((testimonial) => (
              <TestimonialCard key={testimonial.id} t={testimonial} />
            ))}
            {testimonials.length === 0 && (
              <p className="home-empty home-empty--light">Belum ada testimoni.</p>
            )}
          </div>
        </div>
      </section>

      <section className="faq-section home-section" aria-label="FAQ program korporat">
        <div className="container faq-inner">
          <div className="faq-side">
            <span className="section-label">FAQ Korporat</span>
            <h2 className="section-title">Pertanyaan Program Korporat</h2>
            <p className="section-sub">
              Informasi cara mendaftarkan organisasi atau perusahaan Anda.
            </p>
            <div className="faq-cta-box">
              <h3>Siap Mendiskusikan Program?</h3>
              <p>Tim kami siap membuat penawaran sesuai kebutuhan dan anggaran organisasi.</p>
              <a href={waUrl} target="_blank" rel="noreferrer" className="btn-faq">
                <MessageCircle size={15} aria-hidden /> Minta Penawaran
              </a>
            </div>
          </div>
          <div className="faq-content">
            <FAQList faqs={CORPORATE_FAQS} />
          </div>
        </div>
      </section>

      <section className="cta-banner" aria-label="Ajukan program umroh korporat">
        <div className="container cta-inner">
          <span className="section-label">Mulai Sekarang</span>
          <h2 className="section-title">Wujudkan Program Ibadah untuk Organisasi Anda</h2>
          <p className="section-sub">
            Konsultasi gratis dan penawaran program tanpa kewajiban.
          </p>
          <div className="cta-btns">
            <a href={waUrl} target="_blank" rel="noreferrer" className="btn-primary">
              <MessageCircle size={18} aria-hidden /> Minta Penawaran via WhatsApp
            </a>
            <Link href="/paket-umroh" className="btn-outline">Lihat Paket Umroh →</Link>
          </div>
        </div>
      </section>
    </>
  );
}
