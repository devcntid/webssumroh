"use client";

import { useState } from "react";
import Image from "next/image";
import { Check } from "lucide-react";

/**
 * DestinationExplorer — Client Component
 * Data source: editorial destination guide from ref/ss_umroh_app.tsx
 * Client-rendered only for tab switching; all tab content is in the initial payload.
 */

type TabId = "madinah" | "mekkah" | "ziarah" | "hotel";

interface Site {
  name: string;
  arabic: string;
  badge: string;
  description: string;
  image: string;
  imageAlt: string;
  distance?: string;
}

const TABS: Array<{ id: TabId; label: string; icon: string; count: number }> = [
  { id: "madinah", label: "Al-Madinah", icon: "🕌", count: 6 },
  { id: "mekkah", label: "Mekkah Al-Mukarramah", icon: "🏛️", count: 6 },
  { id: "ziarah", label: "Ziarah Tambahan", icon: "📍", count: 5 },
  { id: "hotel", label: "Hotel & Akomodasi", icon: "🏨", count: 2 },
];

const SITES: Record<Exclude<TabId, "hotel">, Site[]> = {
  madinah: [
    {
      name: "Masjid Nabawi",
      arabic: "الْمَسْجِدُ النَّبَوِيُّ",
      distance: "350m dari Hotel",
      badge: "✓ Wajib Dikunjungi",
      description: "Masjid yang dibangun Nabi Muhammad SAW. Sholat di sini setara 1.000 kali. Jamaah SS Umroh bisa berjalan kaki setiap waktu sholat.",
      image: "https://images.unsplash.com/photo-1523151164408-6540213bd2c8?auto=format&fit=crop&w=800&h=500&q=80",
      imageAlt: "Pelataran dan payung Masjid Nabawi di Madinah",
    },
    {
      name: "Raudhah",
      arabic: "الرَّوْضَةُ الشَّرِيفَةُ",
      badge: "⭐ Taman Surga",
      description: "Antara mimbar dan makam Rasulullah SAW — taman surga di Masjid Nabawi. Tempat istimewa untuk berdoa dengan khusyuk.",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRfdqk8o4u1wFLn7Mt46j20pQz2UKoCDGRNxuy3Ks0yXA&s=10",
      imageAlt: "Interior masjid dengan arsitektur Islam di Madinah",
    },
    {
      name: "Makam Baqi",
      arabic: "الْبَقِيعُ",
      badge: "📍 Ziarah",
      description: "Pemakaman bersejarah di sisi timur Masjid Nabawi. Tempat peristirahatan para sahabat, istri, dan keluarga Rasulullah SAW.",
      image: "https://upload.wikimedia.org/wikipedia/commons/e/eb/Al-Baqi_Cemetery_2021.jpg",
      imageAlt: "Lanskap bersejarah kawasan Madinah",
    },
    {
      name: "Masjid Quba",
      arabic: "مَسْجِدُ قُبَاء",
      badge: "🕌 Masjid Pertama",
      description: "Masjid pertama dalam sejarah Islam. Sholat dua rakaat di sini setara pahala umroh. Berjarak sekitar 5 km dari pusat Madinah.",
      image: "https://images.unsplash.com/photo-1580024567801-ff6bf761d652?auto=format&fit=crop&w=800&h=500&q=80",
      imageAlt: "Masjid berwarna putih dengan arsitektur khas Madinah",
    },
    {
      name: "Masjid Qiblatain",
      arabic: "مَسْجِدُ الْقِبْلَتَيْن",
      badge: "⚬ Dua Kiblat",
      description: "Tempat turunnya perintah mengubah kiblat dari Masjidil Aqsa ke Ka'bah saat Rasulullah SAW sedang sholat.",
      image: "https://images.unsplash.com/photo-1512970648279-ff3398568f77?q=80",
      imageAlt: "Masjid dengan kubah dan menara di Arab Saudi",
    },
    {
      name: "Jabal Uhud",
      arabic: "جَبَلُ أُحُد",
      badge: "⛰ Sejarah Islam",
      description: "Bukit tempat Perang Uhud. Rasulullah SAW bersabda bahwa Uhud mencintai kita. Di kawasan ini terdapat makam syuhada Uhud.",
      image: "https://images.unsplash.com/photo-1736240713478-00d2d3043d7d?auto=format&fit=crop&w=800&h=500&q=80",
      imageAlt: "Pegunungan tandus di sekitar Madinah",
    },
  ],
  mekkah: [
    {
      name: "Masjidil Haram",
      arabic: "الْمَسْجِدُ الْحَرَامُ",
      distance: "350m dari Hotel",
      badge: "⭐ Wajib",
      description: "Masjid terbesar dan tersuci di dunia. Sholat di sini setara 100.000 kali dan menjadi pusat seluruh ritual umroh.",
      image: "https://images.unsplash.com/photo-1704104501136-8f35402af395?auto=format&fit=crop&w=800&h=500&q=80",
      imageAlt: "Masjidil Haram di Mekkah",
    },
    {
      name: "Ka'bah — Baitullah",
      arabic: "الْكَعْبَةُ الْمُشَرَّفَةُ",
      badge: "⬟ Baitullah",
      description: "Rumah Allah — titik pusat tawaf dan kiblat seluruh umat Islam. Momen pertama melihat Ka'bah menjadi pengalaman yang mengharukan.",
      image: "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=800&h=500&q=80",
      imageAlt: "Ka'bah di tengah Masjidil Haram",
    },
    {
      name: "Air Zamzam",
      arabic: "مَاءُ زَمْزَم",
      badge: "💧 Paling Berkah",
      description: "Air penuh keberkahan yang memancar sejak zaman Nabi Ibrahim AS. Tersedia bagi jamaah di seluruh area Masjidil Haram.",
      image: "https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?auto=format&fit=crop&w=800&h=500&q=80",
      imageAlt: "Ilustrasi air jernih untuk Air Zamzam",
    },
    {
      name: "Shafa & Marwah",
      arabic: "الصَّفَا وَالْمَرْوَةُ",
      badge: "🏃 Rukun Umroh",
      description: "Tempat Siti Hajar berlari mencari air. Kisahnya diabadikan dalam ritual sa'i tujuh kali sebagai bagian wajib umroh.",
      image: "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=800&h=500&q=80",
      imageAlt: "Lorong berarsitektur Islam untuk ilustrasi Shafa dan Marwah",
    },
    {
      name: "Arafah",
      arabic: "عَرَفَاتُ",
      badge: "🌅 Wukuf Haji",
      description: "Padang luas tempat wukuf — puncak ibadah haji. Rasulullah SAW menyampaikan khutbah Haji Wada di kawasan ini.",
      image: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=800&h=500&q=80",
      imageAlt: "Lanskap padang dan pegunungan di Arab Saudi",
    },
    {
      name: "Jabal Nur & Gua Hira",
      arabic: "جَبَلُ النُّورِ",
      badge: "📖 Wahyu Pertama",
      description: "Bukit tempat Gua Hira berada — lokasi wahyu pertama Al-Qur'an diturunkan kepada Nabi Muhammad SAW.",
      image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=800&h=500&q=80",
      imageAlt: "Pegunungan berbatu untuk ilustrasi Jabal Nur",
    },
  ],
  ziarah: [
    {
      name: "Jabal Tsur & Gua Tsur",
      arabic: "جَبَلُ ثَوْر",
      badge: "📍 Hijrah",
      description: "Tempat Rasulullah SAW dan Abu Bakar bersembunyi selama tiga hari saat perjalanan hijrah menuju Madinah.",
      image: "https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=800&h=500&q=80",
      imageAlt: "Pegunungan batu di Arab Saudi",
    },
    {
      name: "Muzdalifah",
      arabic: "مُزْدَلِفَةُ",
      badge: "🌙 Situs Haji",
      description: "Hamparan antara Arafah dan Mina tempat jamaah haji bermalam dan mengumpulkan batu untuk melontar jumrah.",
      image: "https://images.unsplash.com/photo-1647498985067-48cb34e7a5d6?auto=format&fit=crop&w=800&h=500&q=80",
      imageAlt: "Hamparan gurun dan pegunungan Arab",
    },
    {
      name: "Ji'ranah",
      arabic: "الْجِعِرَّانَةُ",
      badge: "⚬ Miqat",
      description: "Salah satu tempat miqat yang pernah dipilih Rasulullah SAW untuk melaksanakan umroh sunnah tambahan.",
      image: "https://images.unsplash.com/photo-1512632578888-169bbbc64f33?auto=format&fit=crop&w=800&h=500&q=80",
      imageAlt: "Masjid di kawasan pegunungan Arab",
    },
    {
      name: "Pemakaman Ma'la",
      arabic: "مَقْبَرَةُ الْمُعَلَّى",
      badge: "📍 Ziarah",
      description: "Pemakaman bersejarah tempat Khadijah binti Khuwailid dan Abdul Muthalib dimakamkan di Mekkah.",
      image: "https://images.unsplash.com/photo-1580418827493-f2b22c0a76cb?auto=format&fit=crop&w=800&h=500&q=80",
      imageAlt: "Kawasan bersejarah dengan arsitektur Islam",
    },
    {
      name: "Kawasan Maulid Nabi",
      arabic: "مَوْلِدُ النَّبِيِّ ﷺ",
      badge: "⭐ Sejarah",
      description: "Kawasan bersejarah di Mekkah yang diyakini sebagai lokasi kelahiran Nabi Muhammad SAW.",
      image: "https://images.unsplash.com/photo-1578895101408-1a36b834405b?auto=format&fit=crop&w=800&h=500&q=80",
      imageAlt: "Kota Mekkah dengan pegunungan di kejauhan",
    },
  ],
};

const HOTELS = [
  {
    name: "Nozol Munawaroh",
    city: "Al-Madinah",
    stars: 4,
    distance: "350m dari Masjid Nabawi",
    image: "https://images.unsplash.com/photo-1523151164408-6540213bd2c8?auto=format&fit=crop&w=900&h=520&q=80",
    imageAlt: "Masjid Nabawi dekat akomodasi jamaah",
    features: ["Jalan kaki setiap waktu sholat", "Sarapan dan makan malam termasuk", "Kamar standar bintang 4", "WiFi tersedia"],
  },
  {
    name: "Le Meridien Ajyad",
    city: "Mekkah Al-Mukarramah",
    stars: 5,
    distance: "350m dari Masjidil Haram",
    image: "https://hamisbooking.com/wp-content/uploads/Screenshot-2024-02-04-141208.jpg",
    imageAlt: "Masjidil Haram dekat akomodasi jamaah",
    features: ["Tawaf sunnah kapan saja tanpa shuttle", "Hotel bintang 5 dekat Masjidil Haram", "Restoran halal internasional", "Tersedia di paket Bintang 4"],
  },
];

export function DestinationExplorer() {
  const [activeTab, setActiveTab] = useState<TabId>("madinah");
  const activeMeta = TABS.find((tab) => tab.id === activeTab)!;

  return (
    <>
      <nav id="destinasi-guide" className="destination-tabs" aria-label="Kategori destinasi">
        <div className="container destination-tabs-inner">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`destination-tab ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
              aria-pressed={activeTab === tab.id}
            >
              <span aria-hidden>{tab.icon}</span>
              {tab.label}
              <small>{tab.count} {tab.id === "hotel" ? "Hotel" : "Situs"}</small>
            </button>
          ))}
        </div>
      </nav>

      <section className={`destination-panel destination-panel--${activeTab}`} aria-live="polite">
        <div className="container">
          <div className="section-header">
            <span className="section-label">{activeMeta.label}</span>
            <h2 className="section-title">
              {activeTab === "madinah" && "Al-Madinah Al-Munawwarah"}
              {activeTab === "mekkah" && "Mekkah Al-Mukarramah"}
              {activeTab === "ziarah" && "Situs Ziarah Pilihan"}
              {activeTab === "hotel" && "Hotel Dipilih Karena Satu Alasan: Jarak ke Masjid"}
            </h2>
            <p className="section-sub">
              {activeTab === "madinah" && <>Jamaah SS Umroh menginap di <strong>Nozol Munawaroh — 350m dari Masjid Nabawi.</strong></>}
              {activeTab === "mekkah" && <>Jamaah SS Umroh menginap di <strong>Le Meridien Ajyad — 350m dari Masjidil Haram.</strong></>}
              {activeTab === "ziarah" && "Perjalanan ziarah dipandu ustadz agar setiap tempat dipahami sejarah dan hikmahnya."}
              {activeTab === "hotel" && "Hotel harus sedekat mungkin dari masjid agar jamaah bisa beribadah lebih banyak."}
            </p>
          </div>

          {activeTab !== "hotel" ? (
            <div className="destination-grid">
              {SITES[activeTab].map((site) => (
                <article key={site.name} className="destination-site-card">
                  <div className="destination-site-image">
                    <Image src={site.image} alt={site.imageAlt} width={800} height={500} sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                    {site.distance && <span className="destination-distance">{site.distance}</span>}
                  </div>
                  <div className="destination-site-body">
                    <p className="destination-arabic" lang="ar" dir="rtl">{site.arabic}</p>
                    <h3>{site.name}</h3>
                    <p>{site.description}</p>
                    <span className="destination-badge">{site.badge}</span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="package-hotel-grid">
              {HOTELS.map((hotel) => (
                <article key={hotel.name} className="package-hotel-card">
                  <div className="package-hotel-image">
                    <Image src={hotel.image} alt={hotel.imageAlt} width={900} height={520} sizes="(max-width: 768px) 100vw, 50vw" />
                    <span>{hotel.city}</span>
                  </div>
                  <div className="package-hotel-body">
                    <div className="package-hotel-stars" aria-label={`${hotel.stars} bintang`}>{"★".repeat(hotel.stars)}</div>
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
          )}
        </div>
      </section>
    </>
  );
}
