"use client";

import { useState } from "react";
import { MapPin, MessageCircle, Plane } from "lucide-react";
import type { Package, PackageCategory } from "@/types/db";

/**
 * PackageCatalog — Client Component
 * Data source: lib/queries/packages.ts → getActivePackages()
 * CMS: /panel/packages
 * Client-rendered only for category filtering; package data is SSR-provided.
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
  const visiblePackages =
    filter === "all"
      ? packages
      : packages.filter((pkg) => pkg.category === filter);

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
                  <div className="k-icon" aria-hidden>
                    <Plane size={24} />
                  </div>
                  {pkg.tag_line && <span className="k-tag">{pkg.tag_line}</span>}
                  <h2 className="package-list-name">{pkg.name}</h2>
                  <p className="package-list-description">
                    {pkg.description || "Paket umroh dengan fasilitas lengkap dan pendampingan ibadah."}
                  </p>

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
                    <strong>{pkg.price_display_text || "Hubungi CS Kami"}</strong>
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
    </>
  );
}
