"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { DEFAULT_LOGO_COLOR_URL, DEFAULT_LOGO_WHITE_URL } from "@/lib/brand";

interface NavProps {
  /** Color logo — shown when header is scrolled (white background). */
  logoColorUrl?: string;
  /** White logo — shown on transparent/dark header before scroll. */
  logoWhiteUrl?: string;
}

export function Nav({
  logoColorUrl = DEFAULT_LOGO_COLOR_URL,
  logoWhiteUrl = DEFAULT_LOGO_WHITE_URL,
}: NavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <nav className={`nav ${scrolled ? "scrolled" : ""} ${mobileOpen ? "nav--menu-open" : ""}`}>
        <div className="container nav-inner">
          <Link href="/" className="nav-logo" aria-label="SS Umroh beranda">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="nav-logo-img nav-logo-img--white"
              src={logoWhiteUrl}
              alt="SS Umroh"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="nav-logo-img nav-logo-img--color"
              src={logoColorUrl}
              alt=""
              aria-hidden
            />
          </Link>

          <div className="nav-links">
            <div className="nav-item">
              <Link href="/" className={`nav-link ${pathname === "/" ? "active" : ""}`}>Home</Link>
            </div>
            <div className="nav-item">
              <Link href="/paket-umroh" className={`nav-link ${pathname.startsWith("/paket-umroh") ? "active" : ""}`}>Umroh <ChevronDown className="chevron" /></Link>
              <div className="mega">
                <Link href="/paket-umroh" className="mega-item">
                  <div className="mega-icon">🕋</div>
                  <div>
                    <div className="mega-label">Umroh Hemat</div>
                    <div className="mega-desc">Paket ekonomis fasilitas lengkap</div>
                  </div>
                </Link>
                <Link href="/paket-umroh" className="mega-item">
                  <div className="mega-icon">⭐</div>
                  <div>
                    <div className="mega-label">Umroh Bintang 4</div>
                    <div className="mega-desc">Jarak hotel dekat dari Masjid</div>
                  </div>
                </Link>
              </div>
            </div>
            <div className="nav-item">
              <Link href="/korporat" className={`nav-link ${pathname.startsWith("/korporat") ? "active" : ""}`}>Korporat</Link>
            </div>
            <div className="nav-item">
              <Link href="/destinasi" className={`nav-link ${pathname.startsWith("/destinasi") ? "active" : ""}`}>Destinasi</Link>
            </div>
            <div className="nav-item">
              <Link href="/tentang-kami" className={`nav-link ${pathname.startsWith("/tentang-kami") ? "active" : ""}`}>Tentang Kami</Link>
            </div>
          </div>

          <Link
            href="/kontak"
            className={`nav-cta ${pathname.startsWith("/kontak") ? "active" : ""}`}
          >
            Kontak
          </Link>

          <button
            className={`hamburger ${mobileOpen ? "open" : ""}`}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* Mobile Nav Overlay */}
      <div className={`mobile-nav ${mobileOpen ? "open" : ""}`}>
        <Link href="/" onClick={() => setMobileOpen(false)}>Home</Link>
        <Link href="/paket-umroh" onClick={() => setMobileOpen(false)}>Umroh</Link>
        <Link href="/korporat" onClick={() => setMobileOpen(false)}>Korporat</Link>
        <Link href="/destinasi" onClick={() => setMobileOpen(false)}>Destinasi</Link>
        <Link href="/tentang-kami" onClick={() => setMobileOpen(false)}>Tentang Kami</Link>
        <Link
          href="/kontak"
          className={pathname.startsWith("/kontak") ? "active" : ""}
          onClick={() => setMobileOpen(false)}
        >
          Kontak
        </Link>
      </div>
    </>
  );
}
