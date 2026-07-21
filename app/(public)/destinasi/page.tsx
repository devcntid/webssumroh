import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, MessageCircle, Radio, ShieldCheck } from "lucide-react";
import { FAQList } from "@/components/Home/FAQList";
import { ScrollReveal } from "@/components/Home/ScrollReveal";
import { TestimonialCard } from "@/components/Home/TestimonialCard";
import { DestinationExplorer } from "@/components/public/sections/DestinationExplorer";
import { getSiteSettings } from "@/lib/queries/site-settings";
import { getPublicTestimonials } from "@/lib/queries/testimonials";

export const metadata: Metadata = {
  title: "Destinasi Umroh | SS Umroh",
  description:
    "Panduan destinasi ibadah di Madinah, Mekkah, dan situs ziarah dalam perjalanan umroh bersama SS Umroh.",
};

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=1920&q=85";

const DESTINATION_FAQS = [
  {
    id: 1,
    question: "Hotel SS Umroh di Madinah berapa jauh dari Masjid Nabawi?",
    answer: "Jamaah SS Umroh menginap di Nozol Munawaroh, hanya 350m dari Masjid Nabawi — cukup berjalan kaki sekitar 4–5 menit untuk setiap waktu sholat.",
  },
  {
    id: 2,
    question: "Hotel SS Umroh di Mekkah berapa jauh dari Masjidil Haram?",
    answer: "Di Mekkah, jamaah menginap di Le Meridien Ajyad, sekitar 350m dari Masjidil Haram sehingga jamaah dapat beribadah tanpa bergantung pada shuttle.",
  },
  {
    id: 3,
    question: "Apakah jamaah bisa melakukan tawaf sunnah tambahan?",
    answer: "Ya. Karena hotel dekat dari Masjidil Haram, jamaah bisa melakukan tawaf sunnah saat waktu memungkinkan, sendiri atau bersama rombongan.",
  },
  {
    id: 4,
    question: "Apa itu radiophone dan mengapa digunakan?",
    answer: "Radiophone adalah perangkat audio nirkabel dengan jangkauan hingga 200m yang terhubung ke mikrofon ustadz. Jamaah tetap mendengar arahan dengan jelas di tengah keramaian.",
  },
  {
    id: 5,
    question: "Situs ziarah apa saja yang dikunjungi?",
    answer: "Di Madinah antara lain Masjid Nabawi, Raudhah, Baqi, Quba, Qiblatain, dan Jabal Uhud. Di Mekkah antara lain Masjidil Haram, Arafah, Muzdalifah, Jabal Nur, dan Ji'ranah.",
  },
  {
    id: 6,
    question: "Berapa lama durasi perjalanan umroh SS Umroh?",
    answer: "Durasi perjalanan berbeda sesuai program dan jadwal keberangkatan. Tim CS kami akan menjelaskan itinerary lengkap untuk paket yang Anda pilih.",
  },
];

export default async function DestinationsPage() {
  let testimonials: Awaited<ReturnType<typeof getPublicTestimonials>> = [];
  let settings: Awaited<ReturnType<typeof getSiteSettings>> = null;

  try {
    [testimonials, settings] = await Promise.all([
      getPublicTestimonials("general", 3),
      getSiteSettings(),
    ]);
  } catch {
    // Keep editorial destination content available if external services fail.
  }

  const whatsappNumber = settings?.whatsapp_number || "6281312017883";
  const waUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    "Assalamu'alaikum SS Umroh, saya ingin konsultasi paket dan destinasi umroh."
  )}`;

  return (
    <>
      <ScrollReveal />

      <section className="page-hero destination-page-hero" aria-label="Destinasi umroh">
        <div className="ph-bg" style={{ backgroundImage: `url(${HERO_IMAGE})` }} />
        <div className="ph-pattern" />
        <div className="ph-glow" />
        <div className="ph-glow-secondary" />
        <div className="container">
          <div className="ph-content">
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <Link href="/" className="breadcrumb-link">Beranda</Link>
              <span className="breadcrumb-sep">›</span>
              <span className="breadcrumb-cur">Destinasi</span>
            </nav>
            <h1 className="ph-h1">
              Mengenal Tanah Suci —<br />
              <em>Madinah, Mekkah</em> &amp; Situs Ziarah
            </h1>
            <p className="ph-sub">
              Panduan lengkap destinasi ibadah umroh SS Umroh. Setiap situs
              diceritakan dengan makna dan jarak dari hotel.
            </p>
            <div className="ph-badges" role="list">
              <span className="badge-hero ok" role="listitem">
                <ShieldCheck size={14} aria-hidden /> Hotel 350m dari Masjid
              </span>
              <span className="badge-hero" role="listitem">
                <MapPin size={14} aria-hidden /> Madinah + Mekkah
              </span>
              <span className="badge-hero" role="listitem">
                <Radio size={14} aria-hidden /> Radiophone 200m
              </span>
            </div>
            <div className="ph-ctas">
              <a href={waUrl} target="_blank" rel="noreferrer" className="btn-primary">
                <MessageCircle size={18} aria-hidden /> Konsultasi Paket
              </a>
              <a href="#destinasi-guide" className="btn-outline">Jelajahi Destinasi ↓</a>
            </div>
          </div>
        </div>
      </section>

      <DestinationExplorer />

      <section className="testi-section home-section" aria-label="Testimoni jamaah">
        <div className="container">
          <div className="section-header center">
            <span className="section-label">Cerita Jamaah</span>
            <h2 className="section-title section-title--light">
              Perjalanan yang Penuh Makna
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

      <section className="faq-section home-section" aria-label="FAQ destinasi umroh">
        <div className="container faq-inner">
          <div className="faq-side">
            <span className="section-label">FAQ Destinasi</span>
            <h2 className="section-title">Pertanyaan Seputar Destinasi</h2>
            <p className="section-sub">
              Informasi mengenai lokasi ibadah, hotel, dan perjalanan ziarah selama umroh.
            </p>
            <div className="faq-cta-box">
              <h3>Ingin Mengetahui Itinerary?</h3>
              <p>Tim kami siap menjelaskan perjalanan harian dan fasilitas setiap paket.</p>
              <a href={waUrl} target="_blank" rel="noreferrer" className="btn-faq">
                <MessageCircle size={15} aria-hidden /> Chat WhatsApp Sekarang
              </a>
            </div>
          </div>
          <div className="faq-content">
            <FAQList faqs={DESTINATION_FAQS} />
          </div>
        </div>
      </section>

      <section className="cta-banner" aria-label="Ajakan memilih perjalanan">
        <div className="container cta-inner">
          <span className="section-label">Tanah Suci Menanti</span>
          <h2 className="section-title">
            Setiap Destinasi Sudah Menunggu — Kapan Giliran Anda?
          </h2>
          <p className="section-sub">
            Pilih jadwal dan program terbaik untuk perjalanan ibadah yang aman,
            nyaman, dan penuh makna.
          </p>
          <div className="cta-btns">
            <a href={waUrl} target="_blank" rel="noreferrer" className="btn-primary">
              <MessageCircle size={18} aria-hidden /> Konsultasi Gratis
            </a>
            <Link href="/paket-umroh" className="btn-outline">Lihat Paket Umroh →</Link>
          </div>
        </div>
      </section>
    </>
  );
}
