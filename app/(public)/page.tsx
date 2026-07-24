import Link from "next/link";
import Image from "next/image";
import { getFeaturedPackages } from "@/lib/queries/packages";
import { getPublicTestimonials } from "@/lib/queries/testimonials";
import { getPublicFaqs } from "@/lib/queries/faqs";
import { getSiteSettings } from "@/lib/queries/site-settings";
import {
  heroBackgroundStyle,
  heroSectionStyle,
  resolveHeroAppearance,
  resolveHomeSlides,
} from "@/lib/hero-settings";
import { HeroMediaBackground } from "@/components/public/sections/HeroMediaBackground";
import { HomeHeroSlider } from "@/components/public/sections/HomeHeroSlider";
import { PackageCard } from "@/components/Home/PackageCard";
import { TestimonialCard } from "@/components/Home/TestimonialCard";
import { FAQList } from "@/components/Home/FAQList";
import { ScrollReveal } from "@/components/Home/ScrollReveal";
import { AnimatedCounter } from "@/components/Home/AnimatedCounter";
import {
  MessageCircle,
  ShieldCheck,
  HeartHandshake,
  PlaneTakeoff,
  GraduationCap,
  Clock,
  Building,
  Radio,
  Users,
  BookOpen,
} from "lucide-react";

const USTADZ_IMG =
  "https://images.unsplash.com/photo-1573483883644-d0b4b55eb25d?auto=format&fit=crop&w=760&h=950&q=80";

const HERO_BG =
  "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=1920&q=85";

export default async function HomePage() {
  let settings = null;
  let packages: Awaited<ReturnType<typeof getFeaturedPackages>> = [];
  let testimonials: Awaited<ReturnType<typeof getPublicTestimonials>> = [];
  let faqs: Awaited<ReturnType<typeof getPublicFaqs>> = [];
  try {
    [settings, packages, testimonials, faqs] = await Promise.all([
      getSiteSettings(),
      getFeaturedPackages(3),
      getPublicTestimonials("general", 3),
      getPublicFaqs("general", 6),
    ]);
  } catch {
    // DB unavailable — render with empty CMS sections
  }

  const phone = settings?.phone_display || "0813-1201-7883";
  const license = settings?.ppiu_license || "SK PPIU No.U.108/2021";
  const hero = resolveHeroAppearance(settings, "home", HERO_BG);
  const heroSlides = resolveHomeSlides(settings);
  const waUrl = `https://wa.me/${settings?.whatsapp_number || "6281312017883"}?text=Assalamu%27alaikum%20SS%20Umroh%2C%20saya%20ingin%20konsultasi%20paket%20umroh.`;

  return (
    <>
      <ScrollReveal />

      {/* 1. Hero — fullscreen */}
      <section className="home-hero" aria-label="Hero SS Umroh" style={heroSectionStyle(hero)}>
        <div className="ph-bg" style={heroBackgroundStyle(hero)}>
          <HeroMediaBackground hero={hero} posterAlt="Latar hero SS Umroh" />
        </div>
        <div className="ph-pattern" />
        <div className="ph-glow" />
        <div className="ph-glow-secondary" />

        <div className="container home-hero-inner">
          <HomeHeroSlider
            slides={heroSlides}
            eyebrow={
              <div className="ph-eyebrow">
                <span className="ph-eyebrow-dot" aria-hidden />
                Berizin Kemenag · Bandung · Sejak 2012
              </div>
            }
          >
            <div className="ph-chips" role="list">
              <span className="badge-hero ok" role="listitem">
                <ShieldCheck size={14} aria-hidden /> {license.replace(" Tahun ", "/")}
              </span>
              <span className="badge-hero" role="listitem">
                <PlaneTakeoff size={14} aria-hidden /> Direct Flight Jakarta → Madinah
              </span>
              <span className="badge-hero" role="listitem">
                <Users size={14} aria-hidden /> 1.000+ Jamaah · 0 Gagal Berangkat
              </span>
              <span className="badge-hero" role="listitem">
                <Radio size={14} aria-hidden /> Radiophone 200m
              </span>
            </div>

            <div className="ph-ctas">
              <a href={waUrl} target="_blank" rel="noreferrer" className="btn-primary">
                <MessageCircle size={18} aria-hidden /> Konsultasi Gratis
              </a>
              <Link href="/paket-umroh" className="btn-outline">
                Lihat Paket Umroh →
              </Link>
            </div>
          </HomeHeroSlider>
        </div>
      </section>

      {/* 2. Stats Strip */}
      <section className="stats-strip" aria-label="Statistik SS Umroh">
        <div className="container">
          <div className="stats-grid">
            <div className="stats-item">
              <div className="stats-num">
                <AnimatedCounter target={1000} suffix="+" />
              </div>
              <div className="stats-label">Jamaah per Tahun</div>
            </div>
            {[
              ["0", "Gagal Berangkat"],
              ["350m", "Hotel dari Masjid"],
              ["12+", "Tahun Berpengalaman"],
            ].map(([n, l]) => (
              <div key={l} className="stats-item">
                <div className="stats-num">{n}</div>
                <div className="stats-label">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Featured Packages */}
      <section className="home-section home-section--muted" aria-label="Paket umroh pilihan">
        <div className="container">
          <div className="section-header center">
            <span className="section-label">Pilih Paket</span>
            <h2 className="section-title">Paket Umroh Sesuai Kebutuhan Anda</h2>
            <p className="section-sub">
              Keberangkatan hampir setiap bulan. Semua paket sudah termasuk visa,
              asuransi, makan 3x/hari, dan perlengkapan umroh.
            </p>
          </div>

          <div className="pkg-grid">
            {packages.map((pkg) => (
              <PackageCard
                key={pkg.id}
                pkg={pkg}
                waNumber={settings?.whatsapp_number || "6281312017883"}
              />
            ))}
            {packages.length === 0 && (
              <p className="home-empty">Belum ada paket yang aktif saat ini.</p>
            )}
          </div>

          <div className="section-footer">
            <Link href="/paket-umroh" className="pkg-more-link">
              Lihat semua jadwal keberangkatan →
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Pembimbing Ibadah */}
      <section className="home-section home-section--white" aria-label="Pembimbing ibadah">
        <div className="container">
          <div className="ustadz-grid">
            <div className="ustadz-media">
              <div className="ustadz-img-card">
                <Image
                  src={USTADZ_IMG}
                  alt="Ustadz pembimbing SS Umroh sedang membaca Al-Qur'an di masjid"
                  width={760}
                  height={950}
                  sizes="(max-width: 1024px) 100vw, 420px"
                />
              </div>
              <div className="ustadz-stat">
                <div className="ustadz-stat-num">1.000+</div>
                <div className="ustadz-stat-label">Jamaah Dibimbing</div>
              </div>
            </div>

            <div className="ustadz-copy">
              <span className="section-label">Pembimbing Ibadah</span>
              <h2 className="section-title">Ibadah Lebih Khusyuk bersama Ustadz Kami</h2>
              <p className="section-sub">
                Prioritas kami bukan hanya memberangkatkan jamaah — tapi memastikan
                setiap jamaah kembali dengan ibadah yang sempurna dan ilmu yang bertambah.
              </p>

              <ul className="ustadz-feats">
                {[
                  [BookOpen, "Ilmu Mendalam, Penyampaian Hangat", "Ustadz dipilih karena mumpuni dari dua sisi: keilmuan mendalam dan kemampuan menyampaikan yang mudah dipahami semua kalangan jamaah."],
                  [Radio, "Kajian Tauhid Setiap Hari", "Di tanah suci, kajian berlangsung setiap hari. Radiophone 200m memastikan setiap kata terdengar jelas, meski kondisi ramai."],
                  [GraduationCap, "Manasik Intensif Sebelum Berangkat", "Seminggu sebelum berangkat, manasik di hotel berbintang Bandung. Setiap jamaah paham seluruh rukun, tata cara, dan doa sebelum tiba di tanah suci."],
                ].map(([Icon, title, desc]) => {
                  const IconComp = Icon as typeof BookOpen;
                  return (
                    <li key={title as string} className="ustadz-feat">
                      <span className="ustadz-feat-ico" aria-hidden>
                        <IconComp size={17} />
                      </span>
                      <div>
                        <h3 className="ustadz-feat-title">{title as string}</h3>
                        <p className="ustadz-feat-desc">{desc as string}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <Link href="/tentang-kami#tim" className="pkg-more-link">
                Kenali tim pembimbing kami →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Why Choose Us */}
      <section className="home-section home-section--muted" aria-label="Keunggulan SS Umroh">
        <div className="container">
          <div className="section-header center">
            <span className="section-label">Keunggulan</span>
            <h2 className="section-title">Mengapa Memilih SS Umroh?</h2>
          </div>

          <div className="home-feature-grid">
            {[
              [ShieldCheck, "Resmi & Amanah", "Terdaftar resmi sebagai PPIU Kemenag RI. Kami menjaga amanah jamaah 100%."],
              [PlaneTakeoff, "Penerbangan Direct", "Mengutamakan penerbangan langsung tanpa transit untuk kenyamanan maksimal."],
              [Building, "Hotel Dekat Masjid", "Fasilitas hotel bintang 4 dan 5 yang sangat dekat dengan pelataran masjid."],
              [GraduationCap, "Bimbingan Intensif", "Didampingi Ustadz berpengalaman mulai dari manasik hingga di Tanah Suci."],
              [HeartHandshake, "Pelayanan Ramah", "Tim handling dan muthawif yang siap membantu 24 jam dengan sepenuh hati."],
              [Clock, "Jadwal Pasti", "Kepastian jadwal keberangkatan sejak Anda mendaftar (0 gagal berangkat)."],
            ].map(([Icon, title, body]) => {
              const I = Icon as typeof ShieldCheck;
              return (
                <div key={title as string} className="k-card k-card--center">
                  <div className="k-icon"><I size={26} /></div>
                  <h3 className="k-title">{title as string}</h3>
                  <p className="k-body">{body as string}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. Testimonials */}
      <section className="testi-section home-section" aria-label="Testimoni jamaah">
        <div className="container">
          <div className="section-header center">
            <span className="section-label">Testimoni</span>
            <h2 className="section-title section-title--light">Apa Kata Jamaah Kami?</h2>
          </div>

          <div className="t-grid">
            {testimonials.map((t) => (
              <TestimonialCard key={t.id} t={t} />
            ))}
            {testimonials.length === 0 && (
              <p className="home-empty home-empty--light">Belum ada testimoni.</p>
            )}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="faq-section home-section" aria-label="FAQ umroh">
        <div className="container faq-inner">
          <div className="faq-side">
            <span className="section-label">FAQ</span>
            <h2 className="section-title">Pertanyaan yang Sering Diajukan</h2>
            <p className="section-sub">
              Semua yang biasanya perlu Anda tanyakan ke CS — sudah kami jawab di sini.
            </p>

            <div className="faq-cta-box">
              <h3>Pertanyaan Anda Belum Ada?</h3>
              <p>CS kami, Rayu Muharram, siap menjawab kapan saja — tanpa tekanan, tanpa paksaan mendaftar.</p>
              <a href={waUrl} target="_blank" rel="noreferrer" className="btn-faq">
                <MessageCircle size={15} aria-hidden /> Chat WhatsApp Sekarang
              </a>
            </div>
          </div>

          <div className="faq-content">
            {faqs.length > 0 ? (
              <FAQList faqs={faqs} />
            ) : (
              <p className="home-empty">Belum ada FAQ yang ditambahkan.</p>
            )}
            <Link href="/faq" className="faq-more-link">
              Lihat semua 30+ pertanyaan dan jawaban →
            </Link>
          </div>
        </div>
      </section>

      {/* 9. CTA Banner */}
      <section className="cta-banner" aria-label="Ajakan konsultasi">
        <div className="container cta-inner">
          <span className="section-label">Mari Berangkat</span>
          <h2 className="section-title">Wujudkan Niat Suci Anda Tahun Ini</h2>
          <p className="section-sub">
            Jangan tunda lagi panggilan ke Baitullah. Konsultasikan rencana keberangkatan Anda bersama tim SS Umroh sekarang juga.
          </p>
          <div className="cta-btns">
            <a href={waUrl} target="_blank" rel="noreferrer" className="btn-primary">
              <MessageCircle size={18} aria-hidden /> Konsultasi Gratis
            </a>
            <a href={`tel:${phone.replace(/\D/g, "")}`} className="btn-outline">
              Telepon {phone}
            </a>
          </div>
        </div>
      </section>

      {/* 10. Trust Strip */}
      <section className="trust" aria-label="Kepercayaan">
        <div className="container">
          <div className="trust-in">
            <div className="trust-badge">
              <ShieldCheck size={16} aria-hidden /> <span>100% Aman &amp; Terpercaya</span>
            </div>
            <p className="trust-det">
              SS Umroh (PT. Sarana Sadaya) beroperasi di bawah pengawasan ketat Kementerian Agama Republik Indonesia.
              <br />
              <strong>{license}</strong>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
