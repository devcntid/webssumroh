import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MessageCircle, Phone } from "lucide-react";
import { FAQList } from "@/components/Home/FAQList";
import { ScrollReveal } from "@/components/Home/ScrollReveal";
import { TestimonialCard } from "@/components/Home/TestimonialCard";
import { HalalExperienceTabs } from "@/components/public/sections/HalalExperienceTabs";
import { getSiteSettings } from "@/lib/queries/site-settings";
import { getPublicTestimonials } from "@/lib/queries/testimonials";
import {
  heroBackgroundStyle,
  heroSectionStyle,
  resolveHeroAppearance,
} from "@/lib/hero-settings";
import type { Testimonial } from "@/types/db";

export const metadata: Metadata = {
  title: "Halal Tour — Wisata Halal Premium | SS Umroh",
  description:
    "Wisata halal ke 10+ destinasi dunia: Turki, Jepang, Dubai, Uzbekistan, Maroko, dan Eropa. Kuliner halal, jadwal sholat terjaga, hotel Muslim friendly.",
};

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=1920&q=85";

const DESTINATIONS = [
  { id: 1, flag: "🇹🇷", name: "Turki", badge: "🔥 Terpopuler", description: "Istanbul, Cappadocia, Efesus, Pamukkale. Peradaban Islam terbesar — masjid agung, bazaar bersejarah, keindahan alam.", duration: "10D7N", season: "Mar–Mei, Sep–Nov", price: "Rp 15,5 Jt", image: "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=600&q=80" },
  { id: 2, flag: "🇯🇵", name: "Jepang", badge: "⭐ Premium", description: "Tokyo, Kyoto, Osaka, Fuji. Harmoni budaya modern dan tradisi. Kuliner halal semakin mudah ditemukan.", duration: "9D6N", season: "Mar–Apr, Okt–Nov", price: "Rp 22 Jt", image: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=600&q=80" },
  { id: 3, flag: "🇰🇷", name: "Korea Selatan", badge: "✨ Trending", description: "Seoul, Jeju, Busan. Budaya K-pop, istana bersejarah, street food halal. Favorit keluarga muda Muslim.", duration: "7D5N", season: "Sep–Nov, Mar–Mei", price: "Rp 17 Jt", image: "https://images.unsplash.com/photo-1548115184-bc6544d06a58?auto=format&fit=crop&w=600&q=80" },
  { id: 4, flag: "🇺🇿", name: "Uzbekistan", badge: "🕌 Islamic Heritage", description: "Samarkand, Bukhara, Tashkent. Warisan peradaban Islam jalur sutra — madrasah dan situs bersejarah.", duration: "8D6N", season: "Apr–Jun, Sep–Okt", price: "Rp 14 Jt", image: "https://images.unsplash.com/photo-1636308624679-625f2030d903?auto=format&fit=crop&w=600&q=80" },
  { id: 5, flag: "🇦🇪", name: "Dubai", badge: "💎 Luxury", description: "Dubai, Abu Dhabi, Sharjah. Kota paling ramah Muslim di dunia. Masjid megah, mall mewah, desert safari.", duration: "6D4N", season: "Nov–Mar", price: "Rp 13 Jt", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=600&q=80" },
  { id: 6, flag: "🇪🇬", name: "Mesir", badge: "🏛 Peradaban", description: "Kairo, Luxor, Alexandria. Piramida Giza, Masjid Al-Azhar. Peradaban kuno dan warisan Islam berpadu.", duration: "9D7N", season: "Okt–Apr", price: "Rp 16 Jt", image: "https://images.unsplash.com/photo-1539768942893-daf53e448371?auto=format&fit=crop&w=600&q=80" },
  { id: 7, flag: "🇲🇦", name: "Maroko", badge: "✨ Eksotis", description: "Marrakech, Fes, Casablanca, Sahara. Medina bersejarah, riad mewah, dan lanskap yang memukau.", duration: "10D8N", season: "Mar–Mei, Sep–Nov", price: "Rp 19 Jt", image: "https://images.unsplash.com/photo-1489493887464-892be6d1daae?auto=format&fit=crop&w=600&q=80" },
  { id: 8, flag: "🇪🇺", name: "Eropa Muslim Friendly", badge: "🌍 Multi-Country", description: "Paris, Amsterdam, Barcelona. Itinerary khusus Muslim dengan daftar restoran halal dan masjid terdekat.", duration: "12D10N", season: "Jun–Sep", price: "Rp 28 Jt", image: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=600&q=80" },
  { id: 9, flag: "🇲🇾", name: "Malaysia", badge: "✅ Ramah Keluarga", description: "Kuala Lumpur, Penang, Langkawi. Halal food terlengkap di Asia — nyaman untuk keluarga Muslim.", duration: "5D3N", season: "Sepanjang Tahun", price: "Rp 6,5 Jt", image: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=600&q=80" },
  { id: 10, flag: "🇧🇳", name: "Brunei Darussalam", badge: "🕌 Islamic Kingdom", description: "Bandar Seri Begawan. Kerajaan Islam terkaya di Asia Tenggara. Masjid megah dan water village.", duration: "4D3N", season: "Feb–Apr", price: "Rp 8 Jt", image: "https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=600&q=80" },
];

const ADVANTAGES = [
  ["🏨", "Hotel Ramah Muslim", "Hotel dengan fasilitas kiblat, sajadah, Al-Quran, dan waktu sholat di kamar.", "Muslim Friendly"],
  ["🍱", "Restoran Halal", "Setiap destinasi sudah terpetakan restoran halal bersertifikasi.", "Halal Certified"],
  ["🕌", "Jadwal Sholat Terjaga", "Itinerary menghormati waktu sholat 5 waktu dengan masjid terdekat.", "Prayer Friendly"],
  ["🌍", "Destinasi Pilihan", "Hanya destinasi yang terbukti ramah Muslim — sudah disurvei fasilitas halal.", "Curated"],
  ["🚌", "Transportasi Nyaman", "Bus AC, private van — semua armada dipilih untuk kenyamanan keluarga Muslim.", "Comfort Transport"],
  ["🎒", "Tour Leader Profesional", "Fasih bahasa setempat, paham kebutuhan Muslim, siap membantu 24 jam.", "Expert Guide"],
  ["👥", "Small Group Experience", "Maksimal 25 orang per grup untuk pengalaman yang lebih personal.", "Max 25 Orang"],
  ["👨‍👩‍👧‍👦", "Family Friendly", "Itinerary mempertimbangkan kebutuhan anak-anak dan lansia.", "All Ages"],
  ["⭐", "Luxury Accommodation", "Hotel bintang 4–5 di setiap destinasi untuk perjalanan yang berkesan.", "Bintang 4–5"],
  ["📋", "Flexible Itinerary", "Itinerary bisa dikustomisasi sesuai kebutuhan perjalanan Anda.", "Customizable"],
];

const PACKAGES = [
  { id: 1, featured: true, tag: "🔥 Bestseller", seats: 8, country: "🇹🇷 Turki", name: "Halal Tour Turki — Istanbul, Cappadocia & Efesus", metas: ["10D7N", "Direct Flight", "Hotel Bintang 4", "Makan 3x", "Sep 2025"], highlights: "Blue Mosque · Hagia Sophia · Topkapi Palace · Bosphorus Cruise · Cappadocia · Grand Bazaar", price: "Rp 15,5 Jt", image: "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=700&q=80" },
  { id: 2, featured: false, tag: "💎 Luxury", seats: 12, country: "🇦🇪 Dubai / UAE", name: "Halal Tour Dubai — Luxury & Culture Experience", metas: ["6D4N", "Direct Flight", "Hotel Bintang 5", "Makan 3x", "Nov 2025"], highlights: "Burj Khalifa · Dubai Mall · Sheikh Zayed Mosque · Desert Safari · Dhow Cruise · Gold Souk", price: "Rp 13 Jt", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=700&q=80" },
  { id: 3, featured: false, tag: "🕌 Islamic Heritage", seats: 20, country: "🇺🇿 Uzbekistan", name: "Halal Tour Uzbekistan — Jalur Sutra Islam", metas: ["8D6N", "via Tashkent", "Hotel Bintang 4", "Makan 3x", "Okt 2025"], highlights: "Registan Samarkand · Kalon Minaret Bukhara · Makam Imam Bukhari · Chorsu Bazaar", price: "Rp 14 Jt", image: "https://images.unsplash.com/photo-1636308624679-625f2030d903?auto=format&fit=crop&w=700&q=80" },
  { id: 4, featured: false, tag: "⭐ Premium", seats: 6, country: "🇯🇵 Jepang", name: "Halal Tour Jepang — Tokyo, Kyoto, Osaka & Fuji", metas: ["9D6N", "Garuda Direct", "Hotel Bintang 4", "Makan Halal", "Mar 2026"], highlights: "Shibuya · Senso-ji · Fuji-san · Fushimi Inari · Dotonbori · Nara · Bullet Train", price: "Rp 22 Jt", image: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=700&q=80" },
  { id: 5, featured: false, tag: "✨ Eksotis", seats: 15, country: "🇲🇦 Maroko", name: "Halal Tour Maroko — Marrakech, Fes & Sahara", metas: ["10D8N", "via Casablanca", "Riad Bintang 4", "Makan 3x", "Apr 2026"], highlights: "Masjid Hassan II · Medina Marrakech · Fes Medina · Todra Gorge · Sahara Desert Camp", price: "Rp 19 Jt", image: "https://images.unsplash.com/photo-1489493887464-892be6d1daae?auto=format&fit=crop&w=700&q=80" },
  { id: 6, featured: false, tag: "🌍 Best Value", seats: 18, country: "🇪🇺 Eropa Muslim Friendly", name: "Halal Tour Eropa — Paris, Amsterdam & Barcelona", metas: ["12D10N", "via Emirates", "Hotel Bintang 4", "Halal Guide", "Jun 2026"], highlights: "Eiffel Tower · Louvre · Rijksmuseum · Keukenhof · Sagrada Familia · 50+ Halal Restaurants", price: "Rp 28 Jt", image: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=700&q=80" },
];

const TIMELINE_STEPS = [
  { number: "1", icon: "💬", title: "Konsultasi Gratis", description: "Hubungi CS kami via WhatsApp. Ceritakan impian perjalanan Anda — destinasi, budget, durasi, jumlah peserta. Kami mendengarkan tanpa tekanan.", badge: "✓ Gratis, tanpa komitmen" },
  { number: "2", icon: "📋", title: "Penawaran & Itinerary", description: "Tim kami menyiapkan proposal perjalanan lengkap: itinerary harian, breakdown biaya, hotel pilihan, restoran halal, dan jadwal sholat. Semua transparan.", badge: "✓ Dalam 24 jam kerja" },
  { number: "3", icon: "✍️", title: "Pendaftaran & DP", description: "Setujui itinerary, tanda tangani perjanjian, dan bayar uang muka untuk mengamankan kursi. Bisa dicicil atau lunas sesuai kemampuan Anda.", badge: "✓ Cicilan tersedia" },
  { number: "4", icon: "🗂", title: "Persiapan Perjalanan", description: "SS Umroh mengurus visa, tiket pesawat, hotel, dan asuransi. Anda menerima travel kit berisi panduan destinasi, daftar packing, dan tips halal travel.", badge: "✓ Visa & dokumen kami urus" },
  { number: "5", icon: "✈️", title: "Keberangkatan", description: "Berangkat dari bandara pilihan bersama tour leader berpengalaman. Check-in bersama, boarding bersama — tidak ada yang tertinggal.", badge: "✓ Tour leader dedicated" },
  { number: "6", icon: "✓", title: "Pulang dengan Kenangan Terbaik", description: "Tiba di tanah air dengan galeri foto indah, kenangan tak terlupakan, dan hati yang dipenuhi syukur. SS Umroh siap merencanakan perjalanan berikutnya.", badge: "✓ 1.000+ wisatawan puas" },
];

const GALLERY_IMAGES = [
  { src: "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=600&q=80", alt: "Blue Mosque Istanbul" },
  { src: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=600&q=80", alt: "Burj Khalifa Dubai" },
  { src: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=600&q=80", alt: "Fushimi Inari Kyoto" },
  { src: "https://images.unsplash.com/photo-1636308624679-625f2030d903?auto=format&fit=crop&w=600&q=80", alt: "Registan Samarkand" },
  { src: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=600&q=80", alt: "Menara Eiffel Paris" },
  { src: "https://images.unsplash.com/photo-1489493887464-892be6d1daae?auto=format&fit=crop&w=600&q=80", alt: "Medina Marrakech Maroko" },
  { src: "https://images.unsplash.com/photo-1539768942893-daf53e448371?auto=format&fit=crop&w=600&q=80", alt: "Piramida Giza Mesir" },
  { src: "https://images.unsplash.com/photo-1548115184-bc6544d06a58?auto=format&fit=crop&w=600&q=80", alt: "Gyeongbokgung Palace Seoul" },
  { src: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=600&q=80", alt: "Twin Towers Kuala Lumpur" },
];

const VIDEOS = [
  { image: "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=700&q=80", label: "🇹🇷 Halal Tour Turki — Highlights" },
  { image: "https://images.unsplash.com/photo-1636308624679-625f2030d903?auto=format&fit=crop&w=700&q=80", label: "🕌 Islamic Heritage Uzbekistan" },
  { image: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=700&q=80", label: "🍱 Halal Food Guide Jepang" },
];

const HALAL_FAQS = [
  { id: 1, question: "Apakah makanan dijamin halal di semua destinasi?", answer: "Ya. SS Umroh sudah memetakan dan menyeleksi restoran halal bersertifikasi di setiap destinasi. Panduan kuliner halal diberikan sebelum keberangkatan, dan tour leader memastikan semua makanan selama perjalanan grup adalah halal." },
  { id: 2, question: "Bagaimana waktu sholat selama perjalanan?", answer: "Itinerary SS Umroh dirancang untuk menghormati waktu sholat 5 waktu. Tour leader memiliki jadwal sholat lokal dan memastikan ada waktu, tempat, dan musholla atau masjid terdekat di setiap destinasi." },
  { id: 3, question: "Apakah itinerary ramah keluarga dengan anak-anak?", answer: "Ya. SS Umroh memiliki paket family-friendly dengan tempo perjalanan yang lebih santai, aktivitas yang cocok untuk semua usia, dan hotel yang memiliki fasilitas keluarga." },
  { id: 4, question: "Apakah tersedia paket private tour?", answer: "Ya. SS Umroh menyediakan paket private tour untuk pasangan (honeymoon), keluarga, dan kelompok kecil. Private tour memiliki fleksibilitas penuh dalam memilih destinasi, hotel, dan jadwal." },
  { id: 5, question: "Apakah bisa custom itinerary sesuai keinginan?", answer: "Ya. Kami dengan senang hati menyesuaikan itinerary sesuai preferensi Anda — menambah hari di kota tertentu, menghilangkan destinasi yang tidak diminati, atau menambahkan aktivitas khusus." },
  { id: 6, question: "Apakah tersedia cicilan atau pembayaran bertahap?", answer: "Ya. SS Umroh bekerja sama dengan mitra pembiayaan syariah. Bayar DP untuk mengamankan kursi, lunasi sebelum keberangkatan. Hubungi CS untuk detail skema cicilan." },
  { id: 7, question: "Bagaimana proses pendaftaran Halal Tour?", answer: "Sangat mudah: (1) Konsultasi via WhatsApp, (2) Terima proposal dan itinerary, (3) Bayar DP untuk amankan kursi, (4) Kami urus visa, tiket, hotel, (5) Berangkat bersama tour leader kami." },
];

const FALLBACK_TESTIMONIALS: Testimonial[] = [
  { id: -1, full_name: "Rizky Hidayat & Keluarga", initials: "RH", city_or_role: "Jakarta", package_name: "Halal Tour Turki 2024", star_rating: 5, quote_text: "Halal tour Turki bersama SS Umroh benar-benar di luar ekspektasi kami. Tour leader sangat memperhatikan waktu sholat, semua makanan halal 100%, dan hotelnya nyaman banget.", page_context: "halal-tour", date_collected: null, is_verified: true, is_active: true, display_order: 1, created_at: "", updated_at: "", deleted_at: null, created_by: null, updated_by: null },
  { id: -2, full_name: "Muhammad Fauzi", initials: "MF", city_or_role: "Bandung", package_name: "Halal Tour Uzbekistan 2024", star_rating: 5, quote_text: "Ziarah ke makam Imam Bukhari — pengalaman spiritual yang tidak bisa dibeli. SS Umroh paham betul kebutuhan wisatawan Muslim.", page_context: "halal-tour", date_collected: null, is_verified: true, is_active: true, display_order: 2, created_at: "", updated_at: "", deleted_at: null, created_by: null, updated_by: null },
  { id: -3, full_name: "Siti Nurhaliza", initials: "SN", city_or_role: "Surabaya", package_name: "Halal Tour Jepang 2025", star_rating: 5, quote_text: "Jepang dengan itinerary halal friendly dari SS Umroh. Semua restoran sudah dicek, masjid terdekat sudah dipetakan. Anak-anak dan orang tua kami sangat menikmati.", page_context: "halal-tour", date_collected: null, is_verified: true, is_active: true, display_order: 3, created_at: "", updated_at: "", deleted_at: null, created_by: null, updated_by: null },
];

const RELATED_SERVICES = [
  { href: "/paket-umroh", icon: "🕌", name: "Umroh", description: "Hotel 350m dari masjid. Direct flight. Ustadz berpengalaman. 0 gagal berangkat sejak 2012.", arrow: "Lihat Paket Umroh →", active: false },
  { href: "/halal-tour", icon: "🌍", name: "Halal Tour", description: "Wisata halal premium ke 10+ negara. Muslim friendly, kuliner halal, jadwal sholat terjaga.", arrow: "Halaman Ini ✓", active: true },
  { href: "/korporat", icon: "🏢", name: "Korporat & Group", description: "Program umroh dan halal tour untuk perusahaan, instansi, dan komunitas.", arrow: "Lihat Program Korporat →", active: false },
  { href: "/kontak", icon: "💬", name: "Custom Tour", description: "Tidak menemukan paket sesuai? Kami rancang itinerary khusus sesuai kebutuhan Anda.", arrow: "Konsultasi Custom Tour →", active: false },
];

export default async function HalalTourPage() {
  let testimonials: Testimonial[] = [];
  let settings: Awaited<ReturnType<typeof getSiteSettings>> = null;

  try {
    [testimonials, settings] = await Promise.all([
      getPublicTestimonials("halal-tour", 3),
      getSiteSettings(),
    ]);
  } catch {
    // Preserve public halal tour information when external services are unavailable.
  }

  if (testimonials.length === 0) {
    testimonials = FALLBACK_TESTIMONIALS;
  }

  const whatsappNumber = settings?.whatsapp_number || "6281312017883";
  const hero = resolveHeroAppearance(settings, "halal-tour", HERO_IMAGE);
  const waUrl = (message?: string) =>
    `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
      message ?? "Assalamu'alaikum SS Umroh, saya ingin konsultasi Halal Tour."
    )}`;

  return (
    <>
      <ScrollReveal />

      {/* ── HERO ── */}
      <section
        className="page-hero halal-tour-hero"
        aria-label="Halal tour SS Umroh"
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
              <span className="breadcrumb-cur">Halal Tour</span>
            </nav>
            <h1 className="ph-h1">
              Jelajahi Dunia dengan<br />Nyaman, Aman, dan<br />
              <em>Sesuai Syariah</em>
            </h1>
            <p className="ph-sub">
              Nikmati pengalaman wisata halal ke berbagai destinasi pilihan dengan
              itinerary yang dirancang khusus untuk memberikan kenyamanan beribadah,
              kuliner halal, akomodasi berkualitas, dan pengalaman perjalanan yang berkesan.
            </p>
            <div className="ph-badges" role="list">
              <span className="badge-hero ok" role="listitem">✔ Muslim Friendly</span>
              <span className="badge-hero" role="listitem">🍱 Halal Food</span>
              <span className="badge-hero" role="listitem">🏨 Hotel Pilihan</span>
              <span className="badge-hero" role="listitem">🎒 Tour Leader</span>
              <span className="badge-hero" role="listitem">📋 Itinerary Ramah Muslim</span>
            </div>
            <div className="ph-ctas">
              <a href="#ht-paket" className="btn-primary">🌍 Lihat Paket Halal Tour</a>
              <a href={waUrl()} target="_blank" rel="noreferrer" className="btn-outline">
                <MessageCircle size={18} aria-hidden /> Konsultasi Gratis
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURED DESTINATIONS ── */}
      <section className="home-section home-section--muted" aria-label="Destinasi halal tour terpopuler">
        <div className="container">
          <div className="section-header center">
            <span className="section-label">Destinasi Pilihan</span>
            <h2 className="section-title">10 Destinasi Halal Tour Terpopuler</h2>
            <p className="section-sub">
              Dari masjid bersejarah Istanbul hingga keindahan alam Jepang yang damai —
              setiap destinasi dipilih dengan mempertimbangkan ketersediaan fasilitas halal terbaik.
            </p>
          </div>
          <div className="dest-grid-10">
            {DESTINATIONS.map((destination) => (
              <article className="dest-card" key={destination.id}>
                <div className="dest-card-img">
                  <Image
                    src={destination.image}
                    alt={`Destinasi halal tour ${destination.name}`}
                    width={600}
                    height={400}
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 33vw, 20vw"
                  />
                  <div className="dest-card-badge">{destination.badge}</div>
                </div>
                <div className="dest-card-body">
                  <div className="dest-card-flag" aria-hidden>{destination.flag}</div>
                  <div className="dest-card-name">{destination.name}</div>
                  <p className="dest-card-desc">{destination.description}</p>
                  <div className="dest-card-meta">
                    <span className="dest-meta-chip">⏱ {destination.duration}</span>
                    <span className="dest-meta-chip">🌤 {destination.season}</span>
                  </div>
                  <div className="dest-card-price">
                    Mulai <strong>{destination.price}</strong>/orang
                  </div>
                  <a
                    href={waUrl(`Assalamu'alaikum SS Umroh, saya tertarik Halal Tour ${destination.name}.`)}
                    className="dest-card-cta"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Lihat Detail →
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE ── */}
      <section className="home-section home-section--white" aria-label="Keunggulan halal tour SS Umroh">
        <div className="container">
          <div className="section-header center">
            <span className="section-label">Keunggulan Halal Tour SS Umroh</span>
            <h2 className="section-title">
              Bukan Wisata Biasa — Wisata yang <em className="ht-gradient-text">Memuliakan</em>
            </h2>
            <p className="section-sub">
              Setiap detail perjalanan kami rancang mempertimbangkan kebutuhan unik wisatawan Muslim.
            </p>
          </div>
          <div className="why-grid-10">
            {ADVANTAGES.map(([icon, title, description, badge]) => (
              <article className="k-card" key={title}>
                <div className="k-icon" aria-hidden>{icon}</div>
                <h3 className="k-title">{title}</h3>
                <p className="k-body">{description}</p>
                <span className="k-tag">{badge}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── PACKAGE CARDS ── */}
      <section id="ht-paket" className="home-section ht-packages-section" aria-label="Paket halal tour">
        <div className="container">
          <div className="section-header center">
            <span className="section-label">Paket Halal Tour</span>
            <h2 className="section-title">Pilih Paket yang Tepat untuk Perjalanan Anda</h2>
            <p className="section-sub">
              Semua paket dirancang dengan standar halal: hotel Muslim friendly, kuliner halal,
              jadwal sholat terjaga, dan tour leader berpengalaman.
            </p>
          </div>
          <div className="pkg-grid-3">
            {PACKAGES.map((pkg) => (
              <article key={pkg.id} className={`ht-pkg-card${pkg.featured ? " featured" : ""}`}>
                <div className="ht-pkg-img">
                  <Image
                    src={pkg.image}
                    alt={pkg.name}
                    width={700}
                    height={440}
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <span className="ht-pkg-tag">{pkg.tag}</span>
                  <span className="ht-pkg-seats">🪑 Sisa {pkg.seats} kursi</span>
                </div>
                <div className="ht-pkg-body">
                  <div className="ht-pkg-country">{pkg.country}</div>
                  <div className="ht-pkg-name">{pkg.name}</div>
                  <div className="ht-pkg-metas">
                    {pkg.metas.map((meta) => (
                      <span key={meta} className="ht-pkg-meta">{meta}</span>
                    ))}
                  </div>
                  <p className="ht-pkg-highlights">{pkg.highlights}</p>
                  <div className="ht-pkg-price-row">
                    <div>
                      <div className="ht-pkg-label">Mulai dari</div>
                      <div className="ht-pkg-price">
                        {pkg.price}
                        <span className="ht-pkg-unit">/orang</span>
                      </div>
                    </div>
                  </div>
                  <div className="ht-pkg-ctas">
                    <a
                      href={waUrl(`Assalamu'alaikum SS Umroh, saya tertarik ${pkg.name}.`)}
                      className="ht-pkg-btn-wa"
                      target="_blank"
                      rel="noreferrer"
                    >
                      💬 Konsultasi
                    </a>
                    <a href={waUrl()} className="ht-pkg-btn-det" target="_blank" rel="noreferrer">
                      Detail →
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <div className="ht-section-cta">
            <a
              href={waUrl("Assalamu'alaikum SS Umroh, saya ingin melihat semua paket Halal Tour.")}
              target="_blank"
              rel="noreferrer"
              className="btn-primary"
            >
              💬 Lihat Semua Paket via WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* ── EXPERIENCE TABS ── */}
      <section className="home-section ht-experience-section" aria-label="Pengalaman perjalanan halal tour">
        <div className="container">
          <div className="section-header center">
            <span className="section-label">Pengalaman Perjalanan</span>
            <h2 className="section-title">Apa yang Akan Anda Rasakan di Setiap Destinasi</h2>
            <p className="section-sub">
              Setiap aspek perjalanan kami rancang memberikan pengalaman terbaik bagi wisatawan Muslim.
            </p>
          </div>
          <HalalExperienceTabs />
        </div>
      </section>

      {/* ── TIMELINE ── */}
      <section className="home-section home-section--white" aria-label="Alur perjalanan bersama SS Umroh">
        <div className="container">
          <div className="section-header center">
            <span className="section-label">Perjalanan Anda Bersama Kami</span>
            <h2 className="section-title">Dari Konsultasi hingga Pulang dengan Kenangan Indah</h2>
            <p className="section-sub">
              Proses perjalanan bersama SS Umroh dirancang mudah, transparan, dan penuh perhatian di setiap langkah.
            </p>
          </div>
          <div className="timeline">
            {TIMELINE_STEPS.map((step, index) => (
              <div
                key={step.number}
                className="tl-item"
                style={index === TIMELINE_STEPS.length - 1 ? { paddingBottom: 0 } : undefined}
              >
                <div className="tl-dot">{step.number}</div>
                <div className="tl-num">Langkah 0{step.number}</div>
                <div className="tl-title">{step.icon} {step.title}</div>
                <p className="tl-desc">{step.description}</p>
                <span className="tl-badge">{step.badge}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GALLERY ── */}
      <section className="home-section ht-gallery-section" aria-label="Galeri perjalanan halal tour">
        <div className="container">
          <div className="section-header center">
            <span className="section-label">Galeri Perjalanan</span>
            <h2 className="section-title">Sekilas Keindahan di Setiap Destinasi</h2>
            <p className="section-sub">
              Setiap foto adalah cerita nyata dari perjalanan jamaah SS Umroh yang merasakan
              pengalaman halal tour premium.
            </p>
          </div>
          <div className="gallery-grid">
            {GALLERY_IMAGES.map((image) => (
              <div key={image.src} className="gallery-item">
                <Image src={image.src} alt={image.alt} width={600} height={400} sizes="(max-width: 768px) 100vw, 33vw" />
                <div className="gallery-overlay">
                  <span className="gallery-overlay-icon" aria-hidden>🔍</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VIDEO ── */}
      <section className="ht-video-section" aria-label="Video perjalanan halal tour">
        <div className="container">
          <div className="section-header center">
            <span className="section-label section-label--gold">Video Perjalanan</span>
            <h2 className="section-title section-title--light">Rasakan Sebelum Berangkat</h2>
            <p className="section-sub section-sub--light">
              Tonton kisah nyata wisatawan dan jelajahi destinasi impian Anda sebelum memutuskan.
            </p>
          </div>
          <div className="video-grid">
            {VIDEOS.map((video) => (
              <a
                key={video.label}
                className="vid-card"
                href={waUrl(`Assalamu'alaikum SS Umroh, saya ingin melihat video "${video.label}".`)}
                target="_blank"
                rel="noreferrer"
              >
                <Image src={video.image} alt={video.label} width={700} height={440} sizes="(max-width: 768px) 100vw, 33vw" />
                <div className="vid-overlay">
                  <div className="vid-play" aria-hidden>▶</div>
                  <span className="vid-label">{video.label}</span>
                </div>
              </a>
            ))}
          </div>
          <div className="ht-section-cta">
            <a
              href={waUrl("Assalamu'alaikum SS Umroh, saya ingin melihat video halal tour lengkap.")}
              target="_blank"
              rel="noreferrer"
              className="btn-outline"
            >
              💬 Minta Video Lengkap via WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="testi-section home-section" aria-label="Testimoni halal tour">
        <div className="container">
          <div className="section-header center">
            <span className="section-label">Kepercayaan Wisatawan</span>
            <h2 className="section-title section-title--light">
              Cerita Wisatawan Halal Tour SS Umroh
            </h2>
          </div>
          <div className="t-grid">
            {testimonials.map((testimonial) => (
              <TestimonialCard key={testimonial.id} t={testimonial} />
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="faq-section home-section" aria-label="FAQ halal tour">
        <div className="container faq-inner">
          <div className="faq-side">
            <span className="section-label">FAQ Halal Tour</span>
            <h2 className="section-title">Pertanyaan yang Sering Diajukan</h2>
            <p className="section-sub">
              Semua yang perlu Anda ketahui sebelum mendaftar halal tour bersama SS Umroh.
            </p>
            <div className="faq-cta-box">
              <h3>Masih ada pertanyaan?</h3>
              <p>Konsultan kami siap membantu memilih destinasi terbaik sesuai kebutuhan dan anggaran Anda.</p>
              <a href={waUrl()} target="_blank" rel="noreferrer" className="btn-faq">
                <MessageCircle size={15} aria-hidden /> Tanya via WhatsApp
              </a>
            </div>
          </div>
          <div className="faq-content">
            <FAQList faqs={HALAL_FAQS} />
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="cta-banner" aria-label="Mulai perjalanan halal tour">
        <div className="cta-glow" />
        <div className="container cta-inner">
          <span className="section-label">Mulai Perjalanan Anda</span>
          <h2 className="section-title">Siap Merencanakan Liburan Halal Impian Anda?</h2>
          <p className="section-sub">
            Konsultan kami siap membantu memilih destinasi terbaik sesuai kebutuhan,
            anggaran, dan preferensi perjalanan Anda.
          </p>
          <div className="cta-btns">
            <a href={waUrl()} target="_blank" rel="noreferrer" className="btn-primary">
              <MessageCircle size={18} aria-hidden /> WhatsApp · Konsultasi Gratis
            </a>
            <a href="tel:+6281312017883" className="btn-outline">
              <Phone size={18} aria-hidden /> 0813-1201-7883
            </a>
          </div>
          <div className="ht-cta-badges">
            <span className="badge-hero ok">✓ SK PPIU No.U.108/2021</span>
            <span className="badge-hero">✔ Muslim Friendly</span>
            <span className="badge-hero">🍱 Halal Food Guaranteed</span>
            <span className="badge-hero">🛡 Asuransi Perjalanan</span>
          </div>
        </div>
      </section>

      {/* ── RELATED SERVICES ── */}
      <section className="home-section ht-related-section" aria-label="Layanan SS Umroh lainnya">
        <div className="container">
          <div className="section-header center">
            <span className="section-label">Layanan SS Umroh</span>
            <h2 className="section-title">Layanan Perjalanan Religi &amp; Wisata Lainnya</h2>
          </div>
          <div className="rel-services-grid">
            {RELATED_SERVICES.map((service) => (
              <Link
                key={service.name}
                href={service.href}
                className={`rel-card${service.active ? " rel-card--active" : ""}`}
              >
                <div className="rel-icon" aria-hidden>{service.icon}</div>
                <div className="rel-name">{service.name}</div>
                <p className="rel-desc">{service.description}</p>
                <span className="rel-arr">{service.arrow}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
