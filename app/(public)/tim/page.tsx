import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  GraduationCap,
  MessageCircle,
  Radio,
  ShieldCheck,
  Users,
} from "lucide-react";
import { ScrollReveal } from "@/components/Home/ScrollReveal";
import { getSiteSettings } from "@/lib/queries/site-settings";
import { getActiveTeamMembers } from "@/lib/queries/team-members";
import {
  heroBackgroundStyle,
  heroSectionStyle,
  resolveHeroAppearance,
} from "@/lib/hero-settings";
import type { Department, TeamMember } from "@/types/db";

export const metadata: Metadata = {
  title: "Tim Manajemen & Pembimbing | SS Umroh",
  description:
    "Kenali pimpinan, tim manajemen, dan pembimbing umroh SS Umroh yang mendampingi perjalanan ibadah Anda dengan amanah dan profesional.",
};

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1920&q=85";
const DIRECTOR_IMAGE =
  "https://cna.co.id/wp-content/uploads/2019/01/Hamzah-Romzul-500px-x-600px-2.jpg";

const FALLBACK_PHOTO =
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=600&q=80";

/** Static management team used when CMS team_members is empty. */
const FALLBACK_MANAGEMENT: Array<{
  id: number;
  full_name: string;
  role_title: string;
  department: Department;
  photo_url: string;
  bio: string;
}> = [
  {
    id: -1,
    full_name: "Bayu Muharram",
    role_title: "Customer Service Lead",
    department: "Customer Service",
    photo_url:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
    bio: "Menjadi pintu pertama konsultasi jamaah dengan pendekatan yang sabar, jelas, dan tanpa tekanan.",
  },
  {
    id: -2,
    full_name: "Siti Rahmawati",
    role_title: "Operations Manager",
    department: "Operations",
    photo_url:
      "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=600&q=80",
    bio: "Mengorkestrasi keberangkatan, hotel, dan handling di tanah suci agar setiap detail perjalanan berjalan mulus.",
  },
  {
    id: -3,
    full_name: "Ahmad Fauzan",
    role_title: "Marketing Manager",
    department: "Marketing",
    photo_url:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80",
    bio: "Mengomunikasikan nilai amanah SS Umroh dan memastikan informasi paket selalu transparan bagi calon jamaah.",
  },
  {
    id: -4,
    full_name: "Nurul Aisyah",
    role_title: "Finance Supervisor",
    department: "Finance",
    photo_url:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80",
    bio: "Menjaga pencatatan pembayaran, cicilan, dan laporan keuangan jamaah dengan tertib serta akuntabel.",
  },
  {
    id: -5,
    full_name: "Rizky Pratama",
    role_title: "Ground Handling Coordinator",
    department: "Operations",
    photo_url:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80",
    bio: "Mengawal jamaah dari bandara hingga hotel agar proses check-in, bagasi, dan transportasi tetap nyaman.",
  },
  {
    id: -6,
    full_name: "Dewi Lestari",
    role_title: "Document & Visa Specialist",
    department: "Operations",
    photo_url:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=600&q=80",
    bio: "Membantu kelengkapan dokumen dan proses visa agar jamaah siap berangkat tanpa kendala administratif.",
  },
  {
    id: -7,
    full_name: "Fajar Nugraha",
    role_title: "Digital Campaign Specialist",
    department: "Marketing",
    photo_url:
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=600&q=80",
    bio: "Menghadirkan konten edukatif dan penawaran paket yang mudah dipahami di kanal digital SS Umroh.",
  },
  {
    id: -8,
    full_name: "Lina Marlina",
    role_title: "Customer Care Officer",
    department: "Customer Service",
    photo_url:
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=600&q=80",
    bio: "Menindaklanjuti pertanyaan jamaah sebelum dan sesudah keberangkatan dengan respons yang cepat.",
  },
];

const PEMBIMBING = [
  {
    name: "Ustadz Abdullah Hakim",
    role: "Pembimbing Ibadah Senior",
    photo:
      "https://images.unsplash.com/photo-1573483883644-d0b4b55eb25d?auto=format&fit=crop&w=700&q=80",
    bio: "Mendampingi jamaah sejak manasik hingga di tanah suci dengan pendekatan ilmu yang mendalam dan penyampaian yang hangat.",
  },
  {
    name: "Ustadz Muhammad Yusuf",
    role: "Pembimbing Manasik & Kajian",
    photo:
      "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=700&q=80",
    bio: "Memimpin manasik intensif dan kajian harian agar setiap jamaah memahami rukun, tata cara, serta doa dengan tenang.",
  },
  {
    name: "Ustadz Hasan Basri",
    role: "Pembimbing Rombongan",
    photo:
      "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&w=700&q=80",
    bio: "Menjaga kekhusyukan ibadah di lapangan dengan panduan praktis dan radiophone agar arahan terdengar jelas.",
  },
  {
    name: "Ustadzah Fatimah Azzahra",
    role: "Pembimbing Jamaah Wanita",
    photo:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=700&q=80",
    bio: "Mendampingi jamaah wanita dengan perhatian khusus pada kenyamanan, etika perjalanan, dan kebutuhan ibadah.",
  },
];

const PEMBIMBING_FEATURES = [
  {
    icon: BookOpen,
    title: "Ilmu Mendalam, Penyampaian Hangat",
    description:
      "Pembimbing dipilih karena mumpuni dari dua sisi: keilmuan dan kemampuan menyampaikan yang mudah dipahami semua kalangan.",
  },
  {
    icon: Radio,
    title: "Kajian Tauhid Setiap Hari",
    description:
      "Di tanah suci, kajian berlangsung setiap hari. Radiophone 200m memastikan setiap kata terdengar jelas.",
  },
  {
    icon: GraduationCap,
    title: "Manasik Intensif Sebelum Berangkat",
    description:
      "Seminggu sebelum berangkat, manasik diadakan agar setiap jamaah paham rukun, tata cara, dan doa.",
  },
];

function toCard(member: TeamMember | (typeof FALLBACK_MANAGEMENT)[number]) {
  return {
    id: member.id,
    full_name: member.full_name,
    role_title: member.role_title,
    department: member.department,
    photo_url: member.photo_url || FALLBACK_PHOTO,
    bio: member.bio || "Bagian SS Umroh yang berkomitmen melayani jamaah dengan amanah.",
  };
}

export default async function TeamPage() {
  let members: TeamMember[] = [];
  let settings: Awaited<ReturnType<typeof getSiteSettings>> = null;

  try {
    [members, settings] = await Promise.all([
      getActiveTeamMembers(),
      getSiteSettings(),
    ]);
  } catch {
    // Keep page useful when the database is unavailable.
  }

  const managementCards =
    members.length > 0
      ? members.map(toCard)
      : FALLBACK_MANAGEMENT.map(toCard);

  const whatsappNumber = settings?.whatsapp_number || "6281312017883";
  const hero = resolveHeroAppearance(settings, "tim", HERO_IMAGE);
  const license = settings?.ppiu_license || "SK PPIU No.U.108/2021";
  const waUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    "Assalamu'alaikum SS Umroh, saya ingin mengenal lebih lanjut tim manajemen dan pembimbing umroh."
  )}`;

  return (
    <>
      <ScrollReveal />

      <section
        className="page-hero team-page-hero"
        aria-label="Tim SS Umroh"
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
              <span className="breadcrumb-cur">Tim</span>
            </nav>
            <h1 className="ph-h1">
              Tim Manajemen &amp;<br />
              <em>Pembimbing Umroh</em>
            </h1>
            <p className="ph-sub">
              Di balik setiap keberangkatan yang tenang ada orang-orang yang
              menjaga amanah jamaah — dari kantor hingga di tanah suci.
            </p>
            <div className="ph-badges" role="list">
              <span className="badge-hero ok" role="listitem">
                <Users size={14} aria-hidden /> 1.000+ Jamaah per Tahun
              </span>
              <span className="badge-hero" role="listitem">
                <ShieldCheck size={14} aria-hidden /> {license}
              </span>
              <span className="badge-hero" role="listitem">
                <GraduationCap size={14} aria-hidden /> Pembimbing Berpengalaman
              </span>
            </div>
            <div className="ph-ctas">
              <a href="#tim-manajemen" className="btn-primary">
                Lihat Tim Manajemen ↓
              </a>
              <a href="#tim-pembimbing" className="btn-outline">
                Tim Pembimbing
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="home-section team-leader-section" aria-label="Pimpinan SS Umroh">
        <div className="container team-leader-grid">
          <div className="team-leader-media">
            <Image
              src={DIRECTOR_IMAGE}
              alt="Ilustrasi pimpinan SS Umroh"
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="team-leader-img"
            />
            <span>Direktur Utama</span>
          </div>
          <div className="team-leader-copy">
            <span className="section-label">Pimpinan</span>
            <h2 className="section-title">Hamzah Romzul Qurani</h2>
            <p className="team-leader-role">Direktur Utama · PT. Sarana Sadaya</p>
            <p>
              Mendirikan SS Travel pada 2012 dengan modal paling berharga:
              kepercayaan jamaah Bandung yang ingin beribadah umroh dengan tenang
              dan layak.
            </p>
            <p>
              Di bawah kepemimpinannya, SS Umroh berkembang menjadi penyelenggara
              umroh berizin yang melayani lebih dari 1.000 jamaah setiap tahun
              dengan komitmen 0 gagal berangkat.
            </p>
            <blockquote>
              “Amanah jamaah bukan hanya membawa mereka berangkat, tetapi
              memastikan seluruh perjalanan ibadah berlangsung dengan tenang dan
              terlayani.”
            </blockquote>
            <Link href="/tentang-kami" className="team-leader-link">
              Baca cerita perusahaan →
            </Link>
          </div>
        </div>
      </section>

      <section
        id="tim-manajemen"
        className="home-section home-section--muted"
        aria-label="Tim manajemen SS Umroh"
      >
        <div className="container">
          <div className="section-header center">
            <span className="section-label">Tim Manajemen</span>
            <h2 className="section-title">Orang-Orang di Balik Layanan Anda</h2>
            <p className="section-sub">
              Dari operasional hingga layanan pelanggan — setiap divisi bekerja
              agar perjalanan ibadah Anda terencana dengan rapi.
            </p>
          </div>
          <div className="team-member-grid">
            {managementCards.map((member) => (
              <article key={member.id} className="team-member-card">
                <div className="team-member-photo">
                  <Image
                    src={member.photo_url}
                    alt={`Foto ${member.full_name}`}
                    width={600}
                    height={720}
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                </div>
                <div className="team-member-body">
                  <span className="team-dept-chip">{member.department}</span>
                  <h3>{member.full_name}</h3>
                  <p className="team-member-role">{member.role_title}</p>
                  <p className="team-member-bio">{member.bio}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="tim-pembimbing"
        className="home-section team-pembimbing-section"
        aria-label="Tim pembimbing umroh"
      >
        <div className="container">
          <div className="section-header center">
            <span className="section-label">Tim Pembimbing Umroh</span>
            <h2 className="section-title">Ibadah Lebih Khusyuk bersama Pembimbing Kami</h2>
            <p className="section-sub">
              Prioritas kami bukan hanya memberangkatkan jamaah — tapi memastikan
              setiap jamaah kembali dengan ibadah yang sempurna dan ilmu yang
              bertambah.
            </p>
          </div>

          <div className="team-pembimbing-features">
            {PEMBIMBING_FEATURES.map(({ icon: Icon, title, description }) => (
              <article key={title} className="team-feature-card">
                <span className="team-feature-icon" aria-hidden>
                  <Icon size={22} />
                </span>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>

          <div className="team-pembimbing-grid">
            {PEMBIMBING.map((person) => (
              <article key={person.name} className="team-pembimbing-card">
                <div className="team-pembimbing-photo">
                  <Image
                    src={person.photo}
                    alt={`Foto ${person.name}`}
                    width={700}
                    height={840}
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                </div>
                <div className="team-pembimbing-body">
                  <span className="team-dept-chip team-dept-chip--gold">Pembimbing</span>
                  <h3>{person.name}</h3>
                  <p className="team-member-role">{person.role}</p>
                  <p className="team-member-bio">{person.bio}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-banner" aria-label="Konsultasi dengan tim SS Umroh">
        <div className="cta-glow" />
        <div className="container cta-inner">
          <span className="section-label">Siap Berangkat?</span>
          <h2 className="section-title">Konsultasikan Perjalanan Anda dengan Tim Kami</h2>
          <p className="section-sub">
            Customer service dan pembimbing siap membantu menjawab pertanyaan
            seputar paket, jadwal, dan persiapan ibadah.
          </p>
          <div className="cta-btns">
            <a href={waUrl} target="_blank" rel="noreferrer" className="btn-primary">
              <MessageCircle size={18} aria-hidden /> Chat WhatsApp
            </a>
            <Link href="/tentang-kami" className="btn-outline">
              Tentang Kami →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
