import Link from "next/link";
import type { Package } from "@/types/db";
import { Check, MessageCircle, Star } from "lucide-react";

/**
 * PackageCard — Server Component
 * Data source: lib/queries/packages.ts → getFeaturedPackages()
 * CMS: /panel/packages
 * Renders: pricing-style package card on homepage "Pilih Paket" section
 */

interface PackageCardProps {
  pkg: Package;
  waNumber: string;
}

/** Editorial feature bullets per category (static copy, not CMS). */
const FEATURES: Record<string, string[]> = {
  hemat: [
    "Hotel bintang 3+, 350m ke masjid",
    "6 malam Madinah + 4 malam Mekkah",
    "Ustadz pembimbing + Radiophone 200m",
    "Makan fullboard 3x/hari + Visa",
    "Manasik hotel berbintang Bandung",
  ],
  bintang4: [
    "Hotel bintang 4 · Le Meridien Ajyad Mekkah",
    "350m ke Masjidil Haram · Tanpa shuttle",
    "Ustadz berpengalaman + Radiophone 200m",
    "Kajian Tauhid harian di tanah suci",
    "Manasik Grand Preanger · Makan 3x/hari",
  ],
  tabungan: [
    "Cicil harian, mingguan, atau bulanan",
    "Dana aman di rekening BNI atas nama Anda",
    "Pantau saldo via aplikasi / QR Code",
    "Notifikasi WhatsApp setiap transaksi",
    "Konversi otomatis ke paket saat target tercapai",
  ],
  ramadhan: [
    "Beribadah penuh di bulan Ramadhan",
    "Hotel dekat masjid · Tanpa shuttle",
    "Ustadz pembimbing + Radiophone 200m",
    "Makan fullboard 3x/hari + Visa",
    "Manasik hotel berbintang Bandung",
  ],
  group: [
    "Minimal 10 peserta per rombongan",
    "Koordinator khusus untuk group Anda",
    "Ustadz pembimbing + Radiophone 200m",
    "Jadwal fleksibel sesuai kesepakatan",
    "Harga spesial untuk komunitas & instansi",
  ],
};

const HEAD_META: Record<string, { eyebrow: string; sub: string }> = {
  hemat: { eyebrow: "✈ Direct · Saudi Airlines", sub: "Jadwal tersedia setiap bulan" },
  bintang4: { eyebrow: "✈ Direct · Saudi Airlines / Garuda", sub: "Jadwal tersedia setiap bulan" },
  tabungan: { eyebrow: "🏦 Via Bank BNI", sub: "Mulai kapan saja · Berangkat saat siap" },
  ramadhan: { eyebrow: "✈ Direct · Bulan Ramadhan", sub: "Kuota terbatas setiap tahun" },
  group: { eyebrow: "👥 Min. 10 Orang", sub: "Jadwal fleksibel untuk rombongan" },
};

export function PackageCard({ pkg, waNumber }: PackageCardProps) {
  const isSavings = pkg.category === "tabungan";
  const meta = HEAD_META[pkg.category] ?? {
    eyebrow: pkg.flight_type || "✈ Direct Flight",
    sub: "Jadwal tersedia setiap bulan",
  };
  const features = FEATURES[pkg.category] ?? FEATURES.hemat;

  const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(
    `Assalamu'alaikum SS Umroh, saya tertarik dengan paket ${pkg.name}.`
  )}`;

  return (
    <article
      className={`pkg-card ${pkg.is_featured ? "pkg-card--featured" : ""} ${isSavings ? "pkg-card--green" : ""}`}
      aria-label={pkg.name}
    >
      {pkg.is_featured && (
        <span className="pkg-badge">
          <Star size={11} fill="currentColor" aria-hidden /> Paling Dicari
        </span>
      )}

      <header className="pkg-head">
        <span className="pkg-eyebrow">{meta.eyebrow}</span>
        <h3 className="pkg-name">{pkg.name}</h3>
        <span className="pkg-head-sub">{pkg.tag_line || meta.sub}</span>
      </header>

      <div className="pkg-body">
        <ul className="pkg-feats">
          {features.map((f) => (
            <li key={f}>
              <span className="pkg-check" aria-hidden>
                <Check size={11} strokeWidth={3} />
              </span>
              {f}
            </li>
          ))}
        </ul>

        <div className="pkg-price">
          <span className="pkg-price-label">
            {isSavings ? "Mulai menabung dari" : "Harga mulai"}
          </span>
          <strong className="pkg-price-value">
            {isSavings ? "Sesuai Kemampuan" : pkg.price_display_text || "Hubungi CS Kami"}
          </strong>
          <span className="pkg-price-note">
            {isSavings
              ? "Daftar gratis · Tidak ada biaya admin"
              : "DP Rp 5.000.000 · Asuransi & visa termasuk"}
          </span>
        </div>

        <div className="pkg-ctas">
          <a href={waUrl} target="_blank" rel="noreferrer" className="pkg-cta-primary">
            <MessageCircle size={15} aria-hidden />
            {isSavings ? "Daftar Tabungan" : "Tanya Harga & Jadwal"}
          </a>
          <Link href="/paket-umroh" className="pkg-cta-outline">
            {isSavings ? "Pelajari Lebih Lanjut →" : "Lihat Detail Paket →"}
          </Link>
        </div>
      </div>
    </article>
  );
}
