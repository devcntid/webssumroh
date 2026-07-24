/**
 * PackageCard — Client Component
 * Data source: lib/queries/packages.ts → getFeaturedPackages()
 * CMS: /panel/packages
 * Renders: cover thumbnail (4:5, zoomable) + CTA buttons on homepage packages section
 */

"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { MessageCircle, Plane, Star, X, ZoomIn } from "lucide-react";
import type { Package } from "@/types/db";

interface PackageCardProps {
  pkg: Package;
  waNumber: string;
}

export function PackageCard({ pkg, waNumber }: PackageCardProps) {
  const [zoomOpen, setZoomOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const isSavings = pkg.category === "tabungan";

  const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(
    `Assalamu'alaikum SS Umroh, saya tertarik dengan paket ${pkg.name}.`
  )}`;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!zoomOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setZoomOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [zoomOpen]);

  const lightbox =
    mounted &&
    zoomOpen &&
    pkg.cover_image_url &&
    createPortal(
      <div
        className="package-lightbox"
        role="dialog"
        aria-modal="true"
        aria-label={pkg.name}
        onClick={() => setZoomOpen(false)}
      >
        <button
          type="button"
          className="package-lightbox-close"
          aria-label="Tutup"
          onClick={() => setZoomOpen(false)}
        >
          <X size={20} />
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={pkg.cover_image_url}
          alt={pkg.name}
          className="package-lightbox-img"
          onClick={(event) => event.stopPropagation()}
        />
      </div>,
      document.body
    );

  return (
    <article
      className={`pkg-card pkg-card--thumb ${pkg.is_featured ? "pkg-card--featured" : ""} ${isSavings ? "pkg-card--green" : ""}`}
      aria-label={pkg.name}
    >
      {pkg.is_featured && (
        <span className="pkg-badge">
          <Star size={11} fill="currentColor" aria-hidden /> Paling Dicari
        </span>
      )}

      {pkg.cover_image_url ? (
        <button
          type="button"
          className="pkg-thumb package-list-cover--zoom"
          onClick={() => setZoomOpen(true)}
          aria-label={`Perbesar gambar ${pkg.name}`}
        >
          <Image
            src={pkg.cover_image_url}
            alt={pkg.name}
            width={640}
            height={800}
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          <span className="package-list-zoom-hint" aria-hidden>
            <ZoomIn size={16} />
          </span>
        </button>
      ) : (
        <div className="pkg-thumb pkg-thumb--empty" aria-hidden>
          <Plane size={28} />
        </div>
      )}

      <div className="pkg-body pkg-body--thumb">
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

      {lightbox}
    </article>
  );
}
