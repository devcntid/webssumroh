import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Check,
  MapPin,
  MessageCircle,
  PlaneTakeoff,
  Radio,
  ShieldCheck,
} from "lucide-react";
import { FAQList } from "@/components/Home/FAQList";
import { ScrollReveal } from "@/components/Home/ScrollReveal";
import { TestimonialCard } from "@/components/Home/TestimonialCard";
import { PackageCatalog } from "@/components/public/sections/PackageCatalog";
import { getPublicFaqs } from "@/lib/queries/faqs";
import { getActivePackages } from "@/lib/queries/packages";
import { getSiteSettings } from "@/lib/queries/site-settings";
import { getPublicTestimonials } from "@/lib/queries/testimonials";

export const metadata: Metadata = {
  title: "Paket Umroh | SS Umroh",
  description:
    "Pilihan paket umroh direct flight dengan hotel dekat masjid, bimbingan ustadz, dan fasilitas lengkap dari SS Umroh.",
};

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1704104501136-8f35402af395?auto=format&fit=crop&w=1920&q=85";
const MADINAH_HOTEL_IMAGE =
  "https://images.unsplash.com/photo-1523151164408-6540213bd2c8?auto=format&fit=crop&w=900&q=80";
const MAKKAH_HOTEL_IMAGE =
  "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=900&q=80";

const HOTELS = [
  {
    name: "Nozol Munawaroh",
    city: "Al-Madinah",
    stars: 4,
    distance: "350m dari Masjid Nabawi",
    image: MADINAH_HOTEL_IMAGE,
    alt: "Masjid Nabawi di Madinah dekat hotel jamaah SS Umroh",
    features: [
      "350m dari Masjid Nabawi — jalan kaki setiap sholat",
      "Sarapan dan makan malam termasuk",
      "Kamar 2–3 orang, standar bintang 4",
      "WiFi tersedia di seluruh area",
    ],
  },
  {
    name: "Le Meridien Ajyad",
    city: "Mekkah Al-Mukarramah",
    stars: 5,
    distance: "350m dari Masjidil Haram",
    image: MAKKAH_HOTEL_IMAGE,
    alt: "Masjidil Haram di Mekkah dekat hotel jamaah SS Umroh",
    features: [
      "350m dari Masjidil Haram — tawaf sunnah kapan saja",
      "Hotel bintang 5 dekat pelataran Masjidil Haram",
      "Restoran dengan menu halal internasional",
      "Tersedia untuk program Umroh Bintang 4",
    ],
  },
];

export default async function PackageUmrohPage() {
  let packages: Awaited<ReturnType<typeof getActivePackages>> = [];
  let testimonials: Awaited<ReturnType<typeof getPublicTestimonials>> = [];
  let faqs: Awaited<ReturnType<typeof getPublicFaqs>> = [];
  let settings: Awaited<ReturnType<typeof getSiteSettings>> = null;

  try {
    [packages, testimonials, faqs, settings] = await Promise.all([
      getActivePackages(),
      getPublicTestimonials("general", 3),
      getPublicFaqs("general", 6),
      getSiteSettings(),
    ]);
  } catch {
    // Keep the public page useful when external services are unavailable.
  }

  const whatsappNumber = settings?.whatsapp_number || "6281312017883";
  const license = settings?.ppiu_license || "SK PPIU No. U.108 Tahun 2021";
  const waUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    "Assalamu'alaikum SS Umroh, saya ingin konsultasi paket umroh."
  )}`;

  return (
    <>
      <ScrollReveal />

      <section className="page-hero package-page-hero" aria-label="Paket Umroh SS Umroh">
        <div className="ph-bg" style={{ backgroundImage: `url(${HERO_IMAGE})` }} />
        <div className="ph-pattern" />
        <div className="ph-glow" />
        <div className="container">
          <div className="ph-content">
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <Link href="/" className="breadcrumb-link">Beranda</Link>
              <span className="breadcrumb-sep">›</span>
              <span className="breadcrumb-cur">Paket Umroh</span>
            </nav>
            <h1 className="ph-h1">
              Paket Umroh SS Umroh —<br />
              <em>Direct Flight, Hotel Dekat,</em> Harga Terjangkau
            </h1>
            <p className="ph-sub">
              Semua paket menggunakan penerbangan direct tanpa transit, hotel maksimal
              350m dari masjid, ustadz berpengalaman, dan radiophone 200m per rombongan.
            </p>
            <div className="ph-badges" role="list">
              <span className="badge-hero ok" role="listitem">
                <ShieldCheck size={14} aria-hidden /> {license}
              </span>
              <span className="badge-hero" role="listitem">
                <PlaneTakeoff size={14} aria-hidden /> Direct Flight
              </span>
              <span className="badge-hero" role="listitem">
                <MapPin size={14} aria-hidden /> Hotel 350m
              </span>
              <span className="badge-hero" role="listitem">
                <Radio size={14} aria-hidden /> Radiophone 200m
              </span>
            </div>
            <div className="ph-ctas">
              <a href={waUrl} target="_blank" rel="noreferrer" className="btn-primary">
                <MessageCircle size={18} aria-hidden /> Konsultasi Paket
              </a>
              <a href="#paket-list" className="btn-outline">Lihat Paket ↓</a>
            </div>
          </div>
        </div>
      </section>

      <PackageCatalog packages={packages} whatsappNumber={whatsappNumber} />

      <section className="home-section package-hotels-section" aria-label="Akomodasi umroh">
        <div className="container">
          <div className="section-header center">
            <span className="section-label">Akomodasi</span>
            <h2 className="section-title">Hotel 350m dari Masjid — Bukan Kebetulan</h2>
            <p className="section-sub">
              Filosofi SS Umroh: hotel sedekat mungkin dari masjid agar jamaah bisa
              beribadah lebih banyak.
            </p>
          </div>

          <div className="package-hotel-grid">
            {HOTELS.map((hotel) => (
              <article key={hotel.name} className="package-hotel-card">
                <div className="package-hotel-image">
                  <Image
                    src={hotel.image}
                    alt={hotel.alt}
                    width={900}
                    height={520}
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <span>{hotel.city}</span>
                </div>
                <div className="package-hotel-body">
                  <div className="package-hotel-stars" aria-label={`${hotel.stars} bintang`}>
                    {"★".repeat(hotel.stars)}
                  </div>
                  <h3>{hotel.name}</h3>
                  <p className="package-hotel-distance">{hotel.distance}</p>
                  <ul>
                    {hotel.features.map((feature) => (
                      <li key={feature}><Check size={15} aria-hidden /> {feature}</li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="testi-section home-section" aria-label="Testimoni jamaah">
        <div className="container">
          <div className="section-header center">
            <span className="section-label">Testimoni</span>
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

      <section className="faq-section home-section" aria-label="FAQ paket umroh">
        <div className="container faq-inner">
          <div className="faq-side">
            <span className="section-label">FAQ Paket</span>
            <h2 className="section-title">Pertanyaan Seputar Paket Umroh</h2>
            <p className="section-sub">
              Semua yang perlu Anda ketahui sebelum memilih dan mendaftar paket umroh.
            </p>
            <div className="faq-cta-box">
              <h3>Butuh Bantuan Memilih Paket?</h3>
              <p>Tim CS kami siap membantu menyesuaikan paket dengan kebutuhan dan anggaran Anda.</p>
              <a href={waUrl} target="_blank" rel="noreferrer" className="btn-faq">
                <MessageCircle size={15} aria-hidden /> Konsultasi via WhatsApp
              </a>
            </div>
          </div>
          <div className="faq-content">
            {faqs.length > 0 ? (
              <FAQList faqs={faqs} />
            ) : (
              <p className="home-empty">Belum ada FAQ yang ditambahkan.</p>
            )}
          </div>
        </div>
      </section>

      <section className="cta-banner" aria-label="Ajakan konsultasi paket">
        <div className="container cta-inner">
          <span className="section-label">Mulai Sekarang</span>
          <h2 className="section-title">Siap Memulai Perjalanan Ibadah Anda?</h2>
          <p className="section-sub">
            Lebih dari 1.000 jamaah mempercayai SS Umroh setiap tahun. 
            0 gagal berangkat sejak 2012.
          </p>
          <div className="cta-btns">
            <a href={waUrl} target="_blank" rel="noreferrer" className="btn-primary">
              <MessageCircle size={18} aria-hidden /> Konsultasi Gratis via WhatsApp
            </a>
            <Link href="/" className="btn-outline">Kembali ke Beranda →</Link>
          </div>
        </div>
      </section>
    </>
  );
}
