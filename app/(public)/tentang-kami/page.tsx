import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Building2,
  MessageCircle,
  ShieldCheck,
  Users,
} from "lucide-react";
import { FAQList } from "@/components/Home/FAQList";
import { ScrollReveal } from "@/components/Home/ScrollReveal";
import { TestimonialCard } from "@/components/Home/TestimonialCard";
import { getSiteSettings } from "@/lib/queries/site-settings";
import { getPublicTestimonials } from "@/lib/queries/testimonials";

export const metadata: Metadata = {
  title: "Tentang Kami | SS Umroh",
  description:
    "Mengenal perjalanan PT. Sarana Sadaya dan SS Umroh sejak 2012 dalam melayani jamaah dari Bandung dan seluruh Indonesia.",
};

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1920&q=85";
const STORY_IMAGE =
  "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=1000&q=80";
const LEADERSHIP_IMAGE =
  "https://cna.co.id/wp-content/uploads/2019/01/Hamzah-Romzul-500px-x-600px-2.jpg";

const TIMELINE = [
  {
    year: "2012",
    icon: "⭐",
    title: "SS Travel Berdiri di Bandung",
    body: "Hamzah Romzul Qurani mendirikan SS Travel dengan satu standar utama: jamaah harus dapat fokus beribadah tanpa khawatir terhadap teknis perjalanan.",
    tag: "📍 Bandung, Jawa Barat",
  },
  {
    year: "2012–2020",
    icon: "↗",
    title: "Bertumbuh Bersama Jamaah",
    body: "SS Travel berkembang dari rekomendasi jamaah kepada keluarga dan kerabat. Pelayanan kemudian menjangkau jamaah dari berbagai kota di Indonesia.",
    tag: "👥 Jamaah dari seluruh Indonesia",
  },
  {
    year: "2021",
    icon: "🛡",
    title: "Izin Resmi Kemenag RI",
    body: "PT. Sarana Sadaya mendapatkan izin sebagai Penyelenggara Perjalanan Ibadah Umrah dari Kementerian Agama Republik Indonesia.",
    tag: "✓ SK PPIU No. U.108/2021",
  },
  {
    year: "2023",
    icon: "🎉",
    title: "Rebranding Menjadi SS Umroh",
    body: "SS Travel memperkenalkan identitas SS Umroh — nama dan tampilan baru dengan komitmen pelayanan yang tetap sama.",
    tag: "⭐ Identitas Baru, Misi Sama",
  },
  {
    year: "2025",
    icon: "🏠",
    title: "Kantor Baru di Jl. Cihapit",
    body: "Kantor baru di Jl. Cihapit No. 41, Kota Bandung, diresmikan agar pelayanan kepada jamaah semakin mudah dan representatif.",
    tag: "📍 Jl. Cihapit No. 41, Bandung",
  },
];

const ABOUT_FAQS = [
  {
    id: 1,
    question: "Kapan SS Umroh berdiri?",
    answer: "SS Umroh, sebelumnya bernama SS Travel, berdiri pada 2012 di Bandung di bawah PT. Sarana Sadaya. Perusahaan memperoleh izin PPIU pada 2021 dan melakukan rebranding menjadi SS Umroh pada 2023.",
  },
  {
    id: 2,
    question: "Siapa direktur SS Umroh?",
    answer: "SS Umroh dipimpin oleh Hamzah Romzul Qurani selaku Direktur Utama PT. Sarana Sadaya.",
  },
  {
    id: 3,
    question: "Apakah SS Umroh sudah berizin resmi?",
    answer: "Ya. PT. Sarana Sadaya terdaftar sebagai PPIU di Kementerian Agama Republik Indonesia dengan SK PPIU No. U.108 Tahun 2021.",
  },
  {
    id: 4,
    question: "Di mana kantor SS Umroh?",
    answer: "Kantor SS Umroh berada di Jl. Cihapit No. 41, Kota Bandung, Jawa Barat. Silakan menghubungi tim kami sebelum berkunjung.",
  },
  {
    id: 5,
    question: "Berapa jamaah yang dilayani setiap tahun?",
    answer: "SS Umroh melayani lebih dari 1.000 jamaah per tahun yang berasal dari Bandung Raya dan berbagai kota di Indonesia.",
  },
  {
    id: 6,
    question: "Apa yang membedakan SS Umroh?",
    answer: "Tiga standar utama kami adalah hotel dekat masjid, penerbangan direct untuk program pilihan, serta radiophone untuk membantu jamaah mendengar arahan pembimbing.",
  },
];

export default async function AboutPage() {
  let testimonials: Awaited<ReturnType<typeof getPublicTestimonials>> = [];
  let settings: Awaited<ReturnType<typeof getSiteSettings>> = null;

  try {
    [testimonials, settings] = await Promise.all([
      getPublicTestimonials("general", 3),
      getSiteSettings(),
    ]);
  } catch {
    // Keep company information available if external services fail.
  }

  const whatsappNumber = settings?.whatsapp_number || "6281312017883";
  const license = settings?.ppiu_license || "SK PPIU No. U.108 Tahun 2021";
  const office = settings?.office_address || "Jl. Cihapit No. 41, Kota Bandung";
  const waUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    "Assalamu'alaikum SS Umroh, saya ingin mengenal layanan SS Umroh lebih lanjut."
  )}`;

  const companyDetails = [
    ["Nama Perusahaan", "PT. Sarana Sadaya"],
    ["Merek Dagang", "SS Umroh"],
    ["Direktur", "Hamzah Romzul Qurani"],
    ["Berdiri", "2012 (SS Travel)"],
    ["Rebranding", "2023 (SS Umroh)"],
    ["Izin Kemenag", license],
    ["Kantor", office],
  ];

  return (
    <>
      <ScrollReveal />

      <section className="page-hero about-page-hero" aria-label="Tentang SS Umroh">
        <div className="ph-bg" style={{ backgroundImage: `url(${HERO_IMAGE})` }} />
        <div className="ph-pattern" />
        <div className="ph-glow" />
        <div className="container">
          <div className="ph-content">
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <Link href="/" className="breadcrumb-link">Beranda</Link>
              <span className="breadcrumb-sep">›</span>
              <span className="breadcrumb-cur">Tentang Kami</span>
            </nav>
            <h1 className="ph-h1">
              Mengenal <em>SS Umroh</em> —<br />
              Sejak 2012, Lahir dari Kepercayaan
            </h1>
            <p className="ph-sub">
              Kami adalah PT. Sarana Sadaya — biro perjalanan umroh yang tumbuh
              bersama jamaah dari Bandung ke seluruh Indonesia. Satu misi kami:
              memastikan setiap jamaah berangkat dengan tenang dan beribadah khusyuk.
            </p>
            <div className="ph-badges" role="list">
              <span className="badge-hero ok" role="listitem">
                <ShieldCheck size={14} aria-hidden /> {license}
              </span>
              <span className="badge-hero" role="listitem">
                <Building2 size={14} aria-hidden /> Berdiri 2012
              </span>
              <span className="badge-hero" role="listitem">
                <Users size={14} aria-hidden /> 1.000+ Jamaah/Tahun
              </span>
            </div>
            <div className="ph-ctas">
              <a href={waUrl} target="_blank" rel="noreferrer" className="btn-primary">
                <MessageCircle size={18} aria-hidden /> Kenalan via WhatsApp
              </a>
              <a href="#cerita-kami" className="btn-outline">Baca Cerita Kami ↓</a>
            </div>
          </div>
        </div>
      </section>

      <section id="cerita-kami" className="home-section about-story-section" aria-label="Cerita SS Umroh">
        <div className="container about-story-grid">
          <div className="about-story-copy">
            <span className="section-label">Cerita Kami</span>
            <h2 className="section-title">Dari SS Travel hingga SS Umroh</h2>
            <p>Pada tahun <strong>2012</strong>, Hamzah Romzul Qurani mendirikan SS Travel di Bandung dengan satu keyakinan: jamaah harus bisa fokus beribadah tanpa khawatir terhadap teknis perjalanan.</p>
            <p>Selama hampir satu dekade, reputasi dibangun melalui kepercayaan jamaah yang merekomendasikan pelayanan kepada keluarga dan kerabat di berbagai kota.</p>
            <p>Pada <strong>2021</strong> PT. Sarana Sadaya mendapat izin PPIU. Pada <strong>2023</strong> identitas SS Umroh diperkenalkan, kemudian pada <strong>2025</strong> kantor baru di Jl. Cihapit No. 41 diresmikan.</p>

            <div className="about-stat-grid">
              {[
                ["2012", "Tahun Berdiri"],
                ["1.000+", "Jamaah/Tahun"],
                ["0", "Gagal Berangkat"],
                ["45", "Maks./Rombongan"],
              ].map(([number, label]) => (
                <div key={label} className="about-stat">
                  <strong>{number}</strong>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="about-story-media">
            <div className="about-story-image">
              <Image
                src={STORY_IMAGE}
                alt="Ilustrasi tim profesional berdiskusi di kantor"
                width={1000}
                height={720}
                sizes="(max-width: 1024px) 100vw, 48vw"
              />
              <span>Ilustrasi tim profesional</span>
            </div>
            <dl className="about-company-details">
              {companyDetails.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="home-section about-leader-section" aria-label="Pimpinan SS Umroh">
        <div className="container about-leader-grid">
          <div className="about-leader-media">
            <Image
              src={LEADERSHIP_IMAGE}
              alt="Ilustrasi kepemimpinan dan kolaborasi tim profesional"
              width={900}
              height={1100}
              sizes="(max-width: 1024px) 100vw, 36vw"
            />
            <span>Ilustrasi kepemimpinan</span>
          </div>
          <div className="about-leader-copy">
            <span className="section-label">Pimpinan</span>
            <h2 className="section-title">Hamzah Romzul Qurani</h2>
            <p>Mendirikan SS Travel pada 2012 dengan modal paling berharga: kepercayaan jamaah Bandung yang ingin beribadah umroh dengan tenang dan layak.</p>
            <p>Di bawah kepemimpinannya, SS Umroh berkembang menjadi penyelenggara umroh berizin yang melayani lebih dari 1.000 jamaah setiap tahun.</p>
            <blockquote>
              “Amanah jamaah bukan hanya membawa mereka berangkat, tetapi memastikan
              seluruh perjalanan ibadah berlangsung dengan tenang dan terlayani.”
            </blockquote>
            <div className="about-leader-tags">
              <span>✓ 1.000+ Jamaah/Tahun</span>
              <span>🕌 Sejak 2012</span>
              <span>🛡 PPIU Berizin</span>
            </div>
          </div>
        </div>
      </section>

      <section className="home-section about-timeline-section" aria-label="Perjalanan SS Umroh">
        <div className="container">
          <div className="section-header center">
            <span className="section-label">Perjalanan SS Umroh</span>
            <h2 className="section-title">Lebih dari Satu Dekade Melayani Jamaah</h2>
          </div>
          <div className="about-timeline">
            {TIMELINE.map((item) => (
              <article key={item.year} className="about-timeline-item">
                <span className="about-timeline-dot" aria-hidden>{item.icon}</span>
                <p className="about-timeline-year">{item.year}</p>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
                <span className="about-timeline-tag">{item.tag}</span>
              </article>
            ))}
          </div>
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

      <section className="faq-section home-section" aria-label="FAQ tentang SS Umroh">
        <div className="container faq-inner">
          <div className="faq-side">
            <span className="section-label">FAQ</span>
            <h2 className="section-title">Pertanyaan tentang SS Umroh</h2>
            <p className="section-sub">
              Informasi singkat mengenai perusahaan, izin, kantor, dan standar layanan kami.
            </p>
            <div className="faq-cta-box">
              <h3>Ingin Berkunjung ke Kantor?</h3>
              <p>Hubungi tim kami untuk mengatur waktu konsultasi di kantor SS Umroh.</p>
              <a href={waUrl} target="_blank" rel="noreferrer" className="btn-faq">
                <MessageCircle size={15} aria-hidden /> Hubungi via WhatsApp
              </a>
            </div>
          </div>
          <div className="faq-content">
            <FAQList faqs={ABOUT_FAQS} />
          </div>
        </div>
      </section>

      <section className="cta-banner" aria-label="Ajakan memulai perjalanan ibadah">
        <div className="container cta-inner">
          <span className="section-label">Mulai Bersama Kami</span>
          <h2 className="section-title">Siap Memulai Perjalanan Ibadah Anda?</h2>
          <p className="section-sub">
            Konsultasikan kebutuhan Anda bersama tim SS Umroh tanpa biaya dan tanpa paksaan.
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
