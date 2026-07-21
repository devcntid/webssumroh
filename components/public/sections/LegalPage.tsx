/**
 * LegalPage — Server Component
 * Shared presentation for SS Umroh privacy and service-terms pages.
 */

import type { ReactNode } from "react";
import Link from "next/link";
import { FileText, MessageCircle } from "lucide-react";
import { ScrollReveal } from "@/components/Home/ScrollReveal";

export interface LegalSection {
  id: string;
  title: string;
  content: ReactNode;
}

interface LegalPageProps {
  eyebrow: string;
  title: string;
  description: string;
  effectiveDate: string;
  sections: LegalSection[];
}

export function LegalPage({
  eyebrow,
  title,
  description,
  effectiveDate,
  sections,
}: LegalPageProps) {
  return (
    <>
      <ScrollReveal />

      <section className="page-hero legal-page-hero" aria-label={title}>
        <div className="ph-bg legal-hero-bg" />
        <div className="ph-pattern" />
        <div className="ph-glow" />
        <div className="container">
          <div className="ph-content legal-hero-content">
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <Link href="/" className="breadcrumb-link">
                Beranda
              </Link>
              <span className="breadcrumb-sep">›</span>
              <span className="breadcrumb-cur">{eyebrow}</span>
            </nav>
            <span className="legal-hero-icon" aria-hidden>
              <FileText size={28} />
            </span>
            <h1 className="ph-h1">{title}</h1>
            <p className="ph-sub">{description}</p>
            <div className="ph-badges">
              <span className="badge-hero ok">✓ Berlaku sejak {effectiveDate}</span>
              <span className="badge-hero">PT. Sarana Sadaya · SS Umroh</span>
            </div>
          </div>
        </div>
      </section>

      <section className="home-section legal-content-section" aria-label={`Isi ${title}`}>
        <div className="container legal-layout">
          <aside className="legal-sidebar" aria-label="Daftar isi">
            <span className="section-label">Daftar Isi</span>
            <nav>
              {sections.map((section, index) => (
                <a key={section.id} href={`#${section.id}`}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {section.title}
                </a>
              ))}
            </nav>
            <div className="legal-help-card">
              <MessageCircle size={22} aria-hidden />
              <h2>Butuh penjelasan?</h2>
              <p>Tim kami siap membantu menjelaskan informasi di halaman ini.</p>
              <Link href="/kontak">Hubungi Kami →</Link>
            </div>
          </aside>

          <article className="legal-article">
            <header className="legal-article-intro">
              <p>
                Dokumen ini terakhir diperbarui pada <strong>{effectiveDate}</strong>.
                Harap baca seluruh ketentuan dengan saksama.
              </p>
            </header>
            {sections.map((section, index) => (
              <section key={section.id} id={section.id} className="legal-section">
                <span className="legal-section-number">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h2>{section.title}</h2>
                  <div className="legal-section-body">{section.content}</div>
                </div>
              </section>
            ))}
          </article>
        </div>
      </section>
    </>
  );
}
