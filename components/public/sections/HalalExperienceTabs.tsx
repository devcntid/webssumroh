"use client";

/**
 * HalalExperienceTabs — Client Component (tab state)
 * Data source: static content (reference: ref/ss_umroh_app.tsx HalalTourPage)
 * Renders: experience category tabs + cards on /halal-tour
 */

import { useState } from "react";

interface ExperienceItem {
  icon: string;
  title: string;
  description: string;
  badge: string;
}

const TABS = [
  { id: "attraction", icon: "⭐", label: "Top Attractions" },
  { id: "heritage", icon: "🕌", label: "Islamic Heritage" },
  { id: "culinary", icon: "🍱", label: "Halal Culinary" },
  { id: "shopping", icon: "🛍", label: "Shopping" },
  { id: "nature", icon: "🌿", label: "Nature" },
  { id: "culture", icon: "🎭", label: "Culture" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const ITEMS: Record<TabId, ExperienceItem[]> = {
  attraction: [
    { icon: "🕌", title: "Blue Mosque Istanbul", description: "Masjid Sultan Ahmed — ikon Istanbul dengan 6 menara dan kubah berlapis biru. Sholat subuh di sini adalah pengalaman spiritual tak terlupakan.", badge: "Turki" },
    { icon: "🏰", title: "Hagia Sophia", description: "Katedral Byzantium yang kini menjadi masjid kembali. Arsitektur megah yang menyimpan sejarah panjang peradaban Islam di Eropa.", badge: "Turki" },
    { icon: "🏛", title: "Sheikh Zayed Mosque", description: "Masjid terbesar di UAE dengan kapasitas 40.000+ jamaah. Arsitektur marmer putih yang memukau di Abu Dhabi.", badge: "Dubai/UAE" },
    { icon: "🔶", title: "Registan Samarkand", description: "Tiga madrasah megah di alun-alun utama Samarkand — pusat ilmu pengetahuan Islam abad ke-14 di jalur sutra.", badge: "Uzbekistan" },
    { icon: "🗼", title: "Menara Eiffel + Mosque Paris", description: "Melihat Eiffel saat sunrise, lalu sholat dhuhur di Grande Mosquée de Paris — masjid bersejarah yang didirikan 1926.", badge: "Eropa" },
    { icon: "🌸", title: "Fuji & Senso-ji", description: "Keindahan Gunung Fuji yang ikonik dan kuil Senso-ji di Asakusa — dua ikon Jepang dalam satu paket perjalanan.", badge: "Jepang" },
  ],
  heritage: [
    { icon: "📚", title: "Makam Imam Bukhari", description: "Kota Samarkand menyimpan makam Imam Bukhari — perawi hadis paling masyhur. Ziarah yang penuh makna untuk umat Muslim.", badge: "Uzbekistan" },
    { icon: "🕌", title: "Masjid Al-Azhar Kairo", description: "Universitas Islam tertua di dunia, berdiri sejak 972 M. Pusat ilmu Islam selama lebih dari seribu tahun.", badge: "Mesir" },
    { icon: "🔮", title: "Masjid Hassan II Casablanca", description: "Masjid terbesar di Afrika dengan menara tertinggi di dunia (210m). Dibangun di tepi Samudera Atlantik.", badge: "Maroko" },
    { icon: "🏰", title: "Topkapi Palace Istanbul", description: "Bekas istana Kesultanan Ottoman — menyimpan relik Islam termasuk jubah, pedang, dan surat Nabi Muhammad SAW.", badge: "Turki" },
    { icon: "📖", title: "Kalan Minaret Bukhara", description: "Menara yang dibangun pada 1127 M — salah satu struktur Islam tertua yang masih berdiri sempurna di Asia Tengah.", badge: "Uzbekistan" },
    { icon: "🕍", title: "Fes Medina UNESCO", description: "Kota tua Islam terbesar yang masih hidup di dunia. Labirin gang sempit, toko pengrajin, dan masjid bersejarah.", badge: "Maroko" },
  ],
  culinary: [
    { icon: "🥙", title: "Kebab Turki Autentik", description: "Döner kebab, Adana kebab, dan baklava asli Turki. SS Umroh sudah memetakan restoran halal terbaik di setiap kota.", badge: "Turki · Halal 100%" },
    { icon: "🍣", title: "Japanese Halal Ramen & Sushi", description: "50+ restoran halal certified di Tokyo, Kyoto, dan Osaka — sudah dipetakan untuk jamaah SS Umroh.", badge: "Jepang · Halal Certified" },
    { icon: "🫕", title: "Tagine Maroko", description: "Tagine kambing, couscous, dan harira — masakan Maroko berbasis daging halal yang kaya rempah.", badge: "Maroko · Halal 100%" },
    { icon: "🥗", title: "Dubai Brunch Halal", description: "Seafood premium, mezze Arab, dan internasional cuisine di restoran halal bintang 5 Dubai.", badge: "Dubai · Halal Certified" },
    { icon: "🍽", title: "Halal Guide Eropa", description: "Di Paris, Amsterdam, Barcelona — 100+ restoran halal bersertifikasi yang nyaman untuk jamaah.", badge: "Eropa · Halal Guide" },
    { icon: "🍛", title: "Plov Uzbekistan", description: "Nasi pilaf dengan daging domba, wortel, dan rempah — makanan nasional Uzbekistan yang 100% halal.", badge: "Uzbekistan · Halal 100%" },
  ],
  shopping: [
    { icon: "🏪", title: "Grand Bazaar Istanbul", description: "Pasar tertutup terbesar di dunia — 4.000+ toko dengan karpet, rempah, perhiasan, dan cinderamata.", badge: "Turki" },
    { icon: "🏬", title: "Dubai Mall", description: "Mall terbesar di dunia dengan 1.200+ toko. Luxury brands, Aquarium Dubai, Dubai Fountain view.", badge: "Dubai" },
    { icon: "🛒", title: "Akihabara & Shibuya Tokyo", description: "Elektronik, fashion, dan produk unik Jepang. Banyak kosmetik dan makanan Jepang sudah halal certified.", badge: "Jepang" },
    { icon: "🪔", title: "Medina Souks Maroko", description: "Tanneries Fes, kerajinan tangan Marrakech, argan oil, dan karpet Berber.", badge: "Maroko" },
    { icon: "🏅", title: "Gold Souk Dubai", description: "Pasar emas terbesar di dunia. Perhiasan emas 18K–24K dengan harga kompetitif dan desain khas Arab.", badge: "Dubai" },
    { icon: "🎁", title: "Suvenir Uzbekistan", description: "Miniatur Registan, keramik Rischtan, sutra Margilan, dan topi lokal yang cantik dari jalur sutra.", badge: "Uzbekistan" },
  ],
  nature: [
    { icon: "🎈", title: "Hot Air Balloon Cappadocia", description: "Terbang di atas formasi batu peri Cappadocia saat matahari terbit — pengalaman yang selalu masuk bucket list.", badge: "Turki" },
    { icon: "🌊", title: "Pamukkale Thermal Pools", description: "Kolam air panas alami berwarna putih bersalju — keajaiban alam Turki yang dikenal sebagai Kastil Kapas.", badge: "Turki" },
    { icon: "🏔", title: "Gunung Fuji", description: "Gunung paling ikonik di Asia. Pemandangan dari Hakone atau Kawaguchiko yang memantulkan Fuji di danau.", badge: "Jepang" },
    { icon: "🐪", title: "Sahara Desert Camp", description: "Berkemah di padang pasir Sahara, naik unta, dan menyaksikan bintang malam paling terang di Afrika.", badge: "Maroko" },
    { icon: "🌺", title: "Keukenhof Tulip Garden", description: "7 juta bunga tulip di atas 32 hektar — taman bunga paling indah di dunia, hanya buka Maret–Mei.", badge: "Belanda" },
    { icon: "🏖", title: "Pantai Langkawi", description: "Pantai tropis Malaysia dengan air biru jernih, mangrove tour, dan Sky Bridge.", badge: "Malaysia" },
  ],
  culture: [
    { icon: "🎭", title: "Pertunjukan Tari Sufi", description: "Sema Ceremony — tarian sufi Mevlevi yang memukau di Konya. Ritual spiritual yang penuh makna dalam budaya Islam.", badge: "Turki" },
    { icon: "🌸", title: "Matcha Ceremony Jepang", description: "Upacara teh Jepang yang penuh ketenangan. Pengalaman budaya unik dan cocok untuk wisatawan Muslim.", badge: "Jepang" },
    { icon: "🎶", title: "Musik Gnawa Maroko", description: "Musik Gnawa dan Chaabi di Jemaa el-Fna — alun-alun Marrakech yang hidup dengan pertunjukan budaya setiap malam.", badge: "Maroko" },
    { icon: "👘", title: "Hanbok & K-Culture Seoul", description: "Mencoba hanbok di Istana Gyeongbokgung dan menikmati musik tradisional Korea yang kaya.", badge: "Korea Selatan" },
    { icon: "🏺", title: "Pengrajin Keramik Uzbekistan", description: "Bengkel keramik tradisional di Rischtan — melihat langsung proses pembuatan piring khas Uzbekistan.", badge: "Uzbekistan" },
    { icon: "🎨", title: "Arabic Calligraphy Workshop", description: "Workshop kaligrafi Arab di Istanbul — belajar seni tulis Islam dari seniman lokal.", badge: "Turki" },
  ],
};

export function HalalExperienceTabs() {
  const [activeTab, setActiveTab] = useState<TabId>("attraction");

  return (
    <>
      <div className="exp-tabs" role="tablist" aria-label="Kategori pengalaman halal tour">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`exp-tab${activeTab === tab.id ? " active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>
      <div className="exp-grid-3">
        {ITEMS[activeTab].map((item) => (
          <article className="k-card" key={item.title}>
            <div className="k-icon" aria-hidden>{item.icon}</div>
            <h3 className="k-title">{item.title}</h3>
            <p className="k-body">{item.description}</p>
            <span className="k-tag">{item.badge}</span>
          </article>
        ))}
      </div>
    </>
  );
}
