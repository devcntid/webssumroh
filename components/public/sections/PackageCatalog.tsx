"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { MapPin, MessageCircle, Plane, X, ZoomIn } from "lucide-react";
import type { Package, PackageCategory } from "@/types/db";

/**
 * PackageCatalog — Client Component
 * Data source: lib/queries/packages.ts → getActivePackages()
 * CMS: /panel/packages
 * Client-rendered for category filtering + thumbnail lightbox.
 */

interface PackageCatalogProps {
  packages: Package[];
  whatsappNumber: string;
}

type FilterValue = "all" | PackageCategory;

const FILTERS: Array<{ value: FilterValue; label: string }> = [
  { value: "all", label: "Semua Paket" },
  { value: "hemat", label: "Umroh Hemat" },
  { value: "bintang4", label: "Bintang 4" },
  { value: "tabungan", label: "Tabungan" },
  { value: "ramadhan", label: "Ramadhan" },
  { value: "group", label: "Group/Korporat" },
];

export function PackageCatalog({
  packages,
  whatsappNumber,
}: PackageCatalogProps) {
  const [filter, setFilter] = useState<FilterValue>("all");
  const [zoom, setZoom] = useState<{ src: string; alt: string } | null>(null);
  const visiblePackages =
    filter === "all"
      ? packages
      : packages.filter((pkg) => pkg.category === filter);

  useEffect(() => {
    if (!zoom) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setZoom(null);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [zoom]);

  return (
    <>
      <nav className="package-filter-bar" aria-label="Filter paket umroh">
        <div className="container package-filter-inner">
          {FILTERS.map((item) => (
            <button
              key={item.value}
              type="button"
              className={`package-filter-btn ${
                filter === item.value ? "active" : ""
              }`}
              onClick={() => setFilter(item.value)}
              aria-pressed={filter === item.value}
            >
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      <section id="paket-list" className="package-list-section" aria-label="Daftar paket umroh">
        <div className="container">
          <div className="package-page-grid">
            {visiblePackages.map((pkg) => {
              const waUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                `Assalamu'alaikum SS Umroh, saya tertarik dengan ${pkg.name}.`
              )}`;

              return (
                <article
                  key={pkg.id}
                  className={`package-list-card ${
                    pkg.is_featured ? "package-list-card--featured" : ""
                  }`}
                >
                  {pkg.is_featured && (
                    <span className="package-list-featured">Paling Populer</span>
                  )}
                  {pkg.cover_image_url ? (
                    <button
                      type="button"
                      className="package-list-cover package-list-cover--zoom"
                      onClick={() =>
                        setZoom({ src: pkg.cover_image_url!, alt: pkg.name })
                      }
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
                    <div className="package-list-cover package-list-cover--empty" aria-hidden>
                      <Plane size={28} />
                    </div>
                  )}
                  {pkg.tag_line && <span className="k-tag">{pkg.tag_line}</span>}
                  <h2 className="package-list-name">{pkg.name}</h2>
                  <p className="package-list-description">
                    {pkg.description ||
                      "Paket umroh dengan fasilitas lengkap dan pendampingan ibadah."}
                  </p>
                  {pkg.detail_text && (
                    <details className="package-list-details">
                      <summary>Lihat detail paket</summary>
                      <p className="package-list-description package-list-description--full">
                        {pkg.detail_text}
                      </p>
                    </details>
                  )}

                  <div className="package-list-meta">
                    {pkg.hotel_distance_m && (
                      <span>
                        <MapPin size={14} aria-hidden /> {pkg.hotel_distance_m}m dari masjid
                      </span>
                    )}
                    <span>
                      <Plane size={14} aria-hidden /> {pkg.flight_type || "Direct Flight"}
                    </span>
                  </div>

                  <div className="package-list-price">
                    <span>Harga mulai</span>
                    <strong>
                      {pkg.price_display_text ||
                        (pkg.price_idr
                          ? `Rp ${pkg.price_idr.toLocaleString("id-ID")}`
                          : "Hubungi CS Kami")}
                    </strong>
                  </div>

                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-primary package-list-cta"
                  >
                    <MessageCircle size={16} aria-hidden /> Tanya Harga
                  </a>
                </article>
              );
            })}
          </div>

          {visiblePackages.length === 0 && (
            <p className="home-empty">Belum ada paket dalam kategori ini.</p>
          )}
        </div>
      </section>

      {zoom && (
        <div
          className="package-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={zoom.alt}
          onClick={() => setZoom(null)}
        >
          <button
            type="button"
            className="package-lightbox-close"
            aria-label="Tutup"
            onClick={() => setZoom(null)}
          >
            <X size={20} />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={zoom.src}
            alt={zoom.alt}
            className="package-lightbox-img"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
